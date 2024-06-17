import { mapToArray } from "../util"
import { DateString, ShiftName, WorkerName } from "../types/common"
import { ScheduleSpecification } from "../types/specification"
import { Schedule } from "../types/schedule"


// Counts all instances where a worker is assigned to overlapping shifts
export function evaluateWorkerAssignments(
    assignments: Map<DateString, Set<ShiftName>>,
    availability: Set<DateString>
): number {
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
    // Go through all the workers and check for broken constraints
    const workerProblemCounts = mapToArray(spec.workers).map(([workerName, { availability }]) => {
        const assignments = findWorkerSchedule(schedule, workerName) // all the days scheduled

        return evaluateWorkerAssignments(assignments, availability)
    })
    const totalWorkerProblemCount = workerProblemCounts.reduce(sum, 0)

    return totalWorkerProblemCount
}
