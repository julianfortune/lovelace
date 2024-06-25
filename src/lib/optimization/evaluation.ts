import { mapToArray, toDateString } from "../util"
import { ConstraintParameters, ConstraintViolation, DateString, ShiftName, WorkerName } from "../types/common"
import { ScheduleSpecification } from "../types/specification"
import { Schedule } from "../types/schedule"

// Helper function to parse date strings into Date objects
function parseDate(dateStr: DateString): Date {
    return new Date(dateStr);
}

// Helper function to get the number of days between two dates
function daysBetween(d1: Date, d2: Date): number {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Counts all instances where a worker is assigned to overlapping shifts
export function evaluateWorkerAssignments(
    spec: ScheduleSpecification,
    constraintParameters: ConstraintParameters,
    assignments: Map<DateString, Set<ShiftName>>,
    workerName: WorkerName,
): ConstraintViolation[] {

    // TODO: Break into multiple functions

    const workerSpec = spec.workers.get(workerName)

    if (workerSpec == null) throw Error(`Unable to find worker specification for ${workerName}!`)

    var constraintViolations: ConstraintViolation[] = []

    assignments.forEach((shifts, date) => {
        if (shifts.size > 1) {
            constraintViolations.push({
                hard: true,
                penalty: constraintParameters.overlappingShiftsCost,
                message: `${workerName} scheduled for multiple shifts on ${date}`
            })
        }
    })

    // Calculate rest days between shifts
    const dates = Array.from(assignments.keys()).map(parseDate).sort((a, b) => a.getTime() - b.getTime());

    // TODO: Refactor to be easier to read
    for (let i = 1; i < dates.length; i++) {
        const restDays = daysBetween(dates[i - 1], dates[i]) - 1;
        const firstDate = toDateString(dates[i - 1])
        const secondDate = toDateString(dates[i])

        if (restDays < 1) { // TODO: Make configurable
            constraintViolations.push({
                hard: true,
                penalty: constraintParameters.insufficientRestCost,
                message: `${workerName} has ${restDays} rest day(s) between ${firstDate} and ${secondDate}`
            })
        }
    }

    // Calculate workload per month
    const workloadPerMonth = new Map<string, number>();

    assignments.forEach((shifts, date) => {
        const month = date.slice(0, 7); // Extracting the "YYYY-MM" part of the date
        const existingWorkload = workloadPerMonth.get(month) ?? 0

        const workload = Array.from(shifts).map((shiftName) => {
            const shiftSpec = spec.shifts.get(shiftName)

            if (shiftSpec == null) throw Error(`Unable to find shift specification for ${shiftName}!`)

            return shiftSpec.workload
        }).reduce(sum)

        workloadPerMonth.set(month, existingWorkload + workload);
    });

    workloadPerMonth.forEach((workload, month) => {
        if (workload > workerSpec.targetWorkload) {
            constraintViolations.push({
                hard: false,
                penalty: workload - workerSpec.targetWorkload, // TODO: Raise to a power? E.g., square ?
                message: `${workerName} has workload of ${workload} for ${month} (aiming for ${workerSpec.targetWorkload})`
            });
        }
    });

    return constraintViolations
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

export function evaluateSchedule(
    spec: ScheduleSpecification,
    constraintParameters: ConstraintParameters,
    schedule: Schedule
): ConstraintViolation[] {
    // Go through all the workers and check for constraint violations
    const workerConstraintViolations = mapToArray(spec.workers).flatMap(([workerName]) => {
        const assignments = findWorkerSchedule(schedule, workerName) // all the days scheduled

        return evaluateWorkerAssignments(spec, constraintParameters, assignments, workerName)
    })

    // TODO: Function
    const workerSelectionViolations = schedule.flatMap((entry) => {
        const shiftSpec = spec.shifts.get(entry.shift)
        if (shiftSpec == null) throw Error(`Unable to find shift specification for ${entry.shift}!`)

        return Array.from(entry.workers).flatMap((worker) => {
            if (shiftSpec.backup.has(worker)) {
                return [{
                    hard: false,
                    penalty: constraintParameters.backupWorkerCost,
                    message: `Backup worker ${worker} is assigned to ${entry.shift} on ${entry.date}`
                } as ConstraintViolation]
            } else { return [] }
        })
    })

    return workerConstraintViolations.concat(workerSelectionViolations)
}

export function getSchedulePenalty(
    spec: ScheduleSpecification,
    constraintParameters: ConstraintParameters,
    schedule: Schedule,
): number {
    // Go through all the workers and check for constraint violations
    const constraintViolations = evaluateSchedule(spec, constraintParameters, schedule)

    const totalPenalty = constraintViolations.map((cv) => cv.penalty).reduce(sum, 0)

    return totalPenalty
}
