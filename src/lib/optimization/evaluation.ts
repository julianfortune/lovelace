import { daysBetween, mapToArray, pairwise, parseDate, sum, toDateString } from "../util"
import { ConstraintParameters, ConstraintViolation, DateString, ShiftName, WorkerName } from "../types/common"
import { ScheduleSpecification } from "../types/specification"
import { ScheduleEntry } from "../types/schedule"
import { variance } from "mathjs"

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

    if (dates.length > 2) {
        pairwise(dates).forEach(([firstDate, secondDate]) => {
            const restDays = daysBetween(firstDate, secondDate) - 1;

            if (restDays < 1) { // TODO: Make configurable
                constraintViolations.push({
                    hard: true,
                    penalty: constraintParameters.insufficientRestCost,
                    message: `${workerName} has ${restDays} rest day(s) between ${toDateString(firstDate)} and ${toDateString(secondDate)}`
                })
            }
        })

        if (constraintParameters.evenShiftDistributionEnabled) {
            // TODO: Take into account gap start of schedule -> first shift & last shift -> end of schedule
            const restDayCount = pairwise(dates).map(([firstDate, secondDate]) => {
                return daysBetween(firstDate, secondDate) - 1;
            })
            const restVariance = Math.floor(Number(variance(restDayCount, 'unbiased')) / 2)

            constraintViolations.push({
                hard: false,
                penalty: restVariance,
                message: `${workerName} has rest variance of ${restVariance}`
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
                // Square the difference to penalize going over more than going over a little (exponentially)
                penalty: Math.pow((workload - workerSpec.targetWorkload), 2),
                message: `${workerName} has workload of ${workload} for ${month} (aiming for ${workerSpec.targetWorkload})`
            });
        }
    });

    return constraintViolations
}

// Find what shifts a worker is assigned to for the dates that they're assigned to work
export function findWorkerSchedule(schedule: ScheduleEntry[], worker: WorkerName): Map<DateString, Set<ShiftName>> {
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

function findWorkerSelectionViolations(
    spec: ScheduleSpecification,
    constraintParameters: ConstraintParameters,
    schedule: ScheduleEntry[]
): ConstraintViolation[] {
    return schedule.flatMap((entry) => {
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
}

export function evaluateSchedule(
    spec: ScheduleSpecification,
    constraintParameters: ConstraintParameters,
    schedule: ScheduleEntry[]
): ConstraintViolation[] {
    // Go through all the workers and check for constraint violations
    const workerConstraintViolations = mapToArray(spec.workers).flatMap(([workerName]) => {
        const assignments = findWorkerSchedule(schedule, workerName) // all the days scheduled

        return evaluateWorkerAssignments(spec, constraintParameters, assignments, workerName)
    })

    const workerSelectionViolations = findWorkerSelectionViolations(spec, constraintParameters, schedule)

    return workerConstraintViolations.concat(workerSelectionViolations)
}

export function getTotalCost(constraintViolations: ConstraintViolation[],): number {
    return constraintViolations.map((cv) => cv.penalty).reduce(sum, 0)
}

export function getScheduleTotalCost(
    spec: ScheduleSpecification,
    constraintParameters: ConstraintParameters,
    schedule: ScheduleEntry[],
): number {
    // Go through all the workers and check for constraint violations
    const constraintViolations = evaluateSchedule(spec, constraintParameters, schedule)

    const totalPenalty = constraintViolations.map((cv) => cv.penalty).reduce(sum, 0)

    return totalPenalty
}
