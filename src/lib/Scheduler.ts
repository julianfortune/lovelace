import cloneDeep from "lodash.clonedeep"
import { getRandomElement, getRandomElementWithIndex, mapToArray } from "./util"

// === Input ===

export interface ScheduleSpecification {
    workers: Map<WorkerName, WorkerSpecification>
    shifts: Map<ShiftName, ShiftSpecification>
}

export type DateString = string // e.g., "2024-01-01"
export type ShiftName = string
export type WorkerName = string

export interface WorkerSpecification {
    availability: Set<DateString> // { "2024-02-04", "2024-02-05", ... }

    // TODO(later): Extra constraints for workers (e.g., only X days per week, only X days scheduled in a row, ...)
}

export interface ShiftSpecification {
    // The days on which the shift occurs and the exact number of workers required
    occurrences: Map<DateString, ShiftOccurrenceSpecification>

    // TODO(later): Need to make this more granular
    // - Maybe this should be specified as Map < worker -> 'weight' > ?
    // - Different lists for different levels (e.g., primary, secondary, fallback)
    candidates: Set<string>
}

export interface ShiftOccurrenceSpecification {
    maxWorkerCount: number
}


// === Output ===

export type Schedule = ScheduleEntry[]
export type ScheduleEntry = { shift: ShiftName, date: DateString, workers: Set<WorkerName> }

// const evaluateShiftAssignment = (spec: ShiftSpecification, assignment: ShiftAssignment): number => {
//     // Does each occurrence of the shift have the (exactly) correct number of workers
//     const workerCountViolations = spec.occurrences.map(({ date, count: expectedWorkerCount }) => {
//         const workers = assignment.get(date)
//         if (workers == undefined) { throw Error(`Assignment not found for ${date}`) }

//         return Math.abs(expectedWorkerCount - workers.size)
//     }).reduce(sum, 0)

//     // Are the assigned people a subset of the desired `candidates` of the shift
//     const candidatePoolViolations = Array.from(assignment.values()).map((workers) => {
//         const misplacedWorkers = Array.from(workers).filter((w) => !spec.candidates.has(w))
//         return misplacedWorkers.length
//     }).reduce(sum, 0)

//     return workerCountViolations + candidatePoolViolations
// }

// Counts all instances where:
// - a worker is assigned to multiple shifts
// - a worker is not available
export function evaluateWorkerAssignments(assignments: Map<DateString, Set<ShiftName>>, availability: Set<DateString>): number {
    var overlappingAssignmentViolations = 0
    var availabilityViolations = 0

    assignments.forEach((shifts, date) => {
        overlappingAssignmentViolations += shifts.size > 1 ? 1 : 0
        availabilityViolations += availability.has(date) ? 0 : 1
    })

    return overlappingAssignmentViolations + availabilityViolations
}

// Find what shifts a worker is assigned to for the dates that they're assigned to work
export function findWorkerSchedule(schedule: Schedule, worker: WorkerName): Map<DateString, Set<ShiftName>> {
    var workerShiftsByDate: Map<DateString, Set<ShiftName>> = new Map()

    schedule.forEach(({ shift, date, workers }) => {
        if (workers.has(worker)) {
            const existingShifts = workerShiftsByDate.get(date)
            if (existingShifts == undefined) {
                workerShiftsByDate.set(date, new Set([shift]))
            } else {
                workerShiftsByDate.set(date, existingShifts.add(shift))
            }
        }
    });

    return workerShiftsByDate
}

const sum = (a: number, b: number) => a + b

export function evaluateSchedule(spec: ScheduleSpecification, schedule: Schedule): number {
    // Go through all the shifts and check for broken constraints
    // const totalShiftProblemCount = mapToArray(spec.shifts).map(([shiftName, shiftSpec]) => {
    //     const assignment = schedule.get(shiftName)
    //     if (assignment === undefined) { throw new Error(`Unable to find shift ${shiftName} in schedule`) }

    //     return evaluateShiftAssignment(shiftSpec, assignment)
    // }).reduce(sum, 0)

    // Go through all the workers and check for broken constraints
    const workerProblemCounts = mapToArray(spec.workers).map(([workerName, { availability }]) => {
        const assignments = findWorkerSchedule(schedule, workerName) // all the days scheduled

        return evaluateWorkerAssignments(assignments, availability)
    })
    const totalWorkerProblemCount = workerProblemCounts.reduce(sum, 0)

    return totalWorkerProblemCount
}

// export function createInitialSchedule(spec: ScheduleSpecification): Schedule {

// }

enum Operation {
    Add = 'add',
    Remove = 'remove',
    Swap = 'swap'
}

export function getRandomOperation(
    currentWorkerCount: number,
    maxWorkerCount: number,
    alternateWorkerCount: number,
): Operation {
    // Decide what operation to perform (add, remove, swap)
    switch (currentWorkerCount) {
        case 0:
            return Operation.Add
        case maxWorkerCount:
            if (alternateWorkerCount == 0) {
                return Operation.Remove
            } else {
                return getRandomElement([Operation.Swap, Operation.Remove])
            }
        default:
            if (alternateWorkerCount == 0) {
                return Operation.Remove
            } else {
                return getRandomElement([Operation.Swap, Operation.Remove, Operation.Add])
            }
    }
}

export function performOperation(
    operation: Operation, currentWorkers: Set<WorkerName>, alternateWorkers: Array<WorkerName>
): Set<WorkerName> {
    // Decide what operation to perform (add, remove, swap)
    switch (operation) {
        case Operation.Add: {
            return currentWorkers.add(getRandomElement(alternateWorkers))
        }
        case Operation.Remove: {
            const removed = getRandomElement(Array.from(currentWorkers))
            // TODO: THis is stupid
            return new Set(Array.from(currentWorkers).filter((x) => x != removed))
        }
        case Operation.Swap: {
            // First remove a random from `currentWorkers`
            const culledWorkers = performOperation(Operation.Remove, currentWorkers, alternateWorkers)
            // Then add random from `alternateWorkers`
            return performOperation(Operation.Add, culledWorkers, alternateWorkers)
        }
    }
}

export function getRandomAdjacentSchedule(spec: ScheduleSpecification, initial: Schedule): Schedule {
    // Pick random entry in schedule
    const [scheduleEntry, scheduleIndex] = getRandomElementWithIndex(initial)

    const shiftSpec = spec.shifts.get(scheduleEntry.shift)
    if (shiftSpec == undefined) { throw Error(`Unable to find specification for shift ${scheduleEntry.shift}`) }
    const maxWorkerCount = shiftSpec.occurrences.get(scheduleEntry.date)?.maxWorkerCount
    if (maxWorkerCount == undefined) { throw Error(`Unable to find occurrence specification for date ${scheduleEntry.date}`) }

    // Figure out the current and possible workers
    const currentWorkers = scheduleEntry.workers

    const alternateWorkers = Array.from(shiftSpec.candidates).filter((c: WorkerName) => {
        const availability = spec.workers.get(c)?.availability
        if (availability == undefined) { throw Error(`No availability found for ${c}`) }

        return availability.has(scheduleEntry.date) && !currentWorkers.has(c)
    })

    const operation = getRandomOperation(currentWorkers.size, maxWorkerCount, alternateWorkers.length)
    console.log(operation)

    const updatedWorkers = performOperation(operation, currentWorkers, alternateWorkers)

    console.log(updatedWorkers)

    // Create copy that replaces the current schedule entry with updated workers
    const newSchedule = cloneDeep(initial)
    newSchedule[scheduleIndex] = { shift: scheduleEntry.shift, date: scheduleEntry.date, workers: updatedWorkers }

    return newSchedule
}
