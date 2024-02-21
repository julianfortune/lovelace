import { array, map, number, option, set, string } from "fp-ts"
import { getApplySemigroup } from "fp-ts/lib/Apply"
import { Option } from "fp-ts/lib/Option"
import { concatAll } from "fp-ts/lib/Semigroup"
import { SemigroupSum } from "fp-ts/lib/number"

// === Input ===

export type DateString = string // e.g., "2024-01-01"
export type ShiftName = string
export type WorkerName = string

export interface ScheduleSpecification {
    workers: Map<WorkerName, WorkerSpecification>
    shifts: Map<ShiftName, ShiftSpecification>
}

export interface WorkerSpecification {
    availability: Set<DateString> // { "2024-02-04", "2024-02-05", ... }

    // TODO: Extra constraints for workers (e.g., only X days per week, only X days scheduled in a row, ...)
}

export interface ShiftSpecification {
    // The days on which the shift occurs and the exact number of workers required
    occurrences: { date: DateString, count: number }[]

    // TODO: Need to make this more granular
    // - Maybe this should be specified as Map < worker -> 'weight' > ?
    // - Different lists for different levels (e.g., primary, secondary, fallback)
    candidates: Set<string>
}

// === Output ===

export type Schedule = Map<WorkerName, WorkerAssignments>
export type WorkerAssignments = Map<DateString, ShiftName>

// {
//     "Julian": {
//         "2024-01-01": "Shift A",
//         "2024-01-05": "Shift C",
//         ...
//      },
//     "Abby": { ... },
//     ...
// }
// -- "Worker-oriented approach"

// Binary approach
// List of shift / time entries where each element is a binary bit-map for the workers
// []

const concatScores = concatAll(option.getMonoid(number.MonoidSum))(option.some(0))

const mapToArray = <K, A>(map: Map<K, A>) => [...map.entries()]
const valuesToArray = <K, A>(map: Map<K, A>) => [...map.values()]

const evaluateShiftAssignment = (spec: ShiftSpecification, assignment: ShiftAssignment): Option<number> => {
    // Does each occurrence of the shift have the (exactly) correct number of workers
    const occurrenceScores = array.map((o: { date: DateString, count: Number }) => {
        const workersAssigned = option.fromNullable(assignment.get(o.date))

        // Constraint is met if there are the correct number of workers assigned
        return option.flatMap((workers: Set<string>) => {
            return workers.size === o.count ? option.some(0) : option.none
        })(workersAssigned)
    })(spec.occurrences)
    const occurrenceScore = concatScores(occurrenceScores)

    // Are the assigned people a subset of the desired `candidates` of the shift
    const chosenWorkers = map.reduce(string.Ord)(set.empty, set.union(string.Eq))(assignment)
    // TODO: Make this short circuit ?
    const candidateScore = set.reduce(string.Ord)(option.some(0), (acc, worker) => {
        const result = spec.candidates.has(worker) ? option.some(0) : option.none

        return concatScores([acc, result])
    })(chosenWorkers)

    return concatScores([occurrenceScore, candidateScore])
}

const evaluateWorkerAssignments = (assignments: Map<DateString, Set<ShiftName>>, availability: Set<DateString>): Option<number> =>
    concatScores(
        array.map(([date, shifts]: [DateString, Set<ShiftName>]) =>
            (shifts.size == 1 && availability.has(date)) ? option.some(0) : option.none
        )(map.toArray(string.Ord)(assignments))
    )


const findWorkerSchedule = (schedule: Schedule, worker: string): Map<DateString, Set<ShiftName>> => {
    const shifts: [ShiftName, ShiftAssignment][] = map.toArray(string.Ord)(schedule)

    const workerShiftsByDate: [DateString, Set<ShiftName>][] = array.filter(([_, shifts]: [DateString, Set<ShiftName>]) => set.isEmpty(shifts))(
        array.flatMap(
            ([shiftName, assignedShift]: [ShiftName, ShiftAssignment]) => {
                const assignments = map.toArray(string.Ord)(assignedShift)
                return array.map(([date, workers]: [DateString, Set<WorkerName>]): [DateString, Set<ShiftName>] =>
                    workers.has(worker) ? [date, set.singleton(shiftName)] : [date, set.empty]
                )(assignments)
            }
        )(shifts)
    )

    // Convert list of pairs (possibly with duplicates) into single map
    return map.fromFoldable(string.Eq, set.getUnionMonoid(string.Eq), array.Foldable)(workerShiftsByDate)
}

export const evaluateSchedule = (spec: ScheduleSpecification, schedule: Schedule): Option<number> => {
    const shiftScores = spec.shifts.map((s) => {
        const assignment = schedule.get(s.name)
        if (assignment === undefined) {
            throw new Error(`Unable to find shift ${s.name} in schedule`)
        }

        return evaluateShiftAssignment(s, assignment)
    })
    const totalShiftScore = concatScores(shiftScores)

    const workerScores = spec.workers.map((w) => {
        // need to figure out all the days scheduled
        const assignments = findWorkerSchedule(schedule, w.name)

        return evaluateWorkerAssignments(assignments, w.availability)
    })
    const totalWorkerScore = concatScores(workerScores)

    return concatScores([totalShiftScore, totalWorkerScore])
}

// === TODO ===

// Find a better datatype to represent calendar dates e.g., custom `CalendarDate` interface / data class

// Alter evaluation process to have an intermediate value
// -----------------------------------------------------------------------------
// - It would be really cool to have the evaluation functions return structs, and then have a different function to
//   reduce the struct down to a single value--primarily for debugging purposes

export interface ScheduleEvaluation {
    workers: Map<WorkerName, WorkerEvaluation>
    shifts: Map<ShiftName, ShiftEvaluation>

    // LATER: Add in Ada's scoring system
    // - Workers' schedules are balanced
}

export interface WorkerEvaluation {
    unavailableShifts: Map<DateString, ShiftName> // Shifts scheduled but worker is unavailable -- expect to be empty
    conflictingShifts: Map<DateString, Set<ShiftName>>
}

export interface ShiftEvaluation {
    occurrences: Map<DateString, Set<WorkerName>>
}
