import { getApplySemigroup } from "fp-ts/lib/Apply"
import * as O from "fp-ts/lib/Option"
import { Option } from "fp-ts/lib/Option"
import { concatAll } from "fp-ts/lib/Semigroup"
import { SemigroupSum } from "fp-ts/lib/number"

// === Input ===

export type DateString = string // e.g., "2024-01-01"
export type ShiftName = string
export type WorkerName = string

export interface ScheduleSpec {
    // NOTE: These could be maps mapping the identifier to the data (instead of lists with `name` in data)

    workers: WorkerSpec[]
    shifts: ShiftSpec[]
}

export interface WorkerSpec {
    name: string
    availability: Set<DateString> // { "2024-02-04", "2024-02-05", ... }

    // TODO: Extra constraints for workers (e.g., only X days per week, only X days scheduled in a row, ...)
}

export interface ShiftSpec {
    name: string

    // The days on which the shift occurs and the exact number of workers required
    occurrences: Map<DateString, number>

    // TODO: Need to make this more granular
    // - Maybe this should be specified as Map < worker -> 'weight' > ?
    // - Different lists for different levels (e.g., primary, secondary, fallback)
    candidates: Set<string>
}

// === Output ===

export type Schedule = Map<ShiftName, ShiftAssignment>
export type ShiftAssignment = Map<DateString, WorkerName[]>

// Ideas for how to represent the schedule
// { "Shift A": { "2024-01-01": ["Abby", "Julian"], ... }, ... } -- "Shift-oriented approach"
// { "Julian": { "2024-01-01": "Shift A", ... }, "Abby": { ... } , ... } -- "Worker-oriented approach"

const SemigroupOptionSum = getApplySemigroup(O.Apply)(SemigroupSum)

const concatScores = concatAll(SemigroupOptionSum)(O.some(0))

const evaluateShiftAssignment = (spec: ShiftSpec, assignment: ShiftAssignment): Option<number> => {
    // Does this shift have the (exactly) correct number of workers
    const occurrenceScore = [...spec.occurrences.entries()].map((entry) => {
        const [date, count] = entry
        const workersAssigned = O.fromNullable(assignment.get(date))

        return O.flatMap((workers: string[]) => {
            // Constraint is met if there are the correct number of workers assigned
            return workers.length === count ? O.some(0) : O.none
        })(workersAssigned)
    }).reduce(SemigroupOptionSum.concat)

    // Are the assigned people a subset of the desired `candidates` of the shift
    const chosenWorkers = [...assignment.values()].reduce((x, y) => x.concat(y))
    // TODO: Make this short circuit ?
    const candidateScore = chosenWorkers.reduce<Option<number>>((acc, worker) => {
        const result = spec.candidates.has(worker) ? O.some(0) : O.none

        return SemigroupOptionSum.concat(result, acc)
    }, O.some(0))

    return concatScores([occurrenceScore, candidateScore])
}

const evaluateWorkerAssignments = (assignments: DateString[], availability: Set<DateString>): Option<number> => {
    return concatScores(assignments.map((assignedDate) => {
        return availability.has(assignedDate) ? O.some(0) : O.none
    }))
}

const findWorkerSchedule = (schedule: Schedule, worker: string): DateString[] =>
    [...schedule.values()].flatMap((assignedShift) =>
        [...assignedShift.entries()].flatMap((entry) => {
            const [date, workers] = entry

            return workers.includes(worker) ? [date] : []
        })
    )

export const evaluateSchedule = (spec: ScheduleSpec, schedule: Schedule): Option<number> => {
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


    // TODO: Make sure none of the shifts the worker is assigned to overlap

    const scores = [totalShiftScore, totalWorkerScore]
    return concatAll(SemigroupOptionSum)(O.some(0))(scores)
}

// === TODO ===

// Make `ShiftAssignment` `Map<DateString, Set<WorkerName>>` to preclude a worker being listed twice

// Remove the `DateString` `Map`'s for now since they're creating more problems than solutions

// Find / write some helper functions for common operations

// Find a better datatype to represent calendar dates e.g., custom `CalendarDate` interface / data class

// Alter evaluation process to have an intermediate value
// -----------------------------------------------------------------------------
// - It would be really cool to have the evaluation functions return structs, and then have a different function to
//   reduce the struct down to a single value--primarily for debugging purposes

export interface ScheduleEvaluation {
    workers: WorkerEvaluation[]
    shifts: ShiftEvaluation[]

    // LATER: Add in Ada's scoring system
    // - Workers' schedules are balanced
}

export interface WorkerEvaluation {
    name: WorkerName
    unavailableDates: DateString[] // expect to be empty
}

export interface ShiftEvaluation {
    name: ShiftName
    occurrences: ShiftOccurrenceEvaluation[]
}

export interface ShiftOccurrenceEvaluation {
    date: DateString
    candidates: Option<number>
}
