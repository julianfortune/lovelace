import { mapToArray } from "../util"
import { DateString, ShiftName, WorkerName } from "../types/common"
import { ScheduleSpecification } from "../types/specification"
import { Schedule } from "../types/schedule"


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
