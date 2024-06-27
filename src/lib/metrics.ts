import { findWorkerSchedule } from "./optimization/evaluation"
import { WorkerName, WorkloadEvaluation } from "./types/common"
import { ScheduleEntry } from "./types/schedule"
import { ScheduleSpecification } from "./types/specification"
import { mapToArray, sum } from "./util"


export function getWorkloadEvaluations(
    spec: ScheduleSpecification,
    schedule: ScheduleEntry[]
): WorkloadEvaluation[] {

    const months = Array.from(new Set(schedule.map((x) =>
        x.date.slice(0, 7) // Extracting the "YYYY-MM" part of the date
    ))).sort()

    console.log(">>> Months:", months)

    return mapToArray(spec.workers).flatMap(([workerName]) => {
        const assignments = findWorkerSchedule(schedule, workerName) // all the days scheduled

        const workerSpec = spec.workers.get(workerName)
        if (workerSpec == null) throw Error(`Unable to find worker specification for ${workerName}!`)

        const workloadPerMonth = new Map<string, number>();

        assignments.forEach((shifts, date) => {
            const month = date.slice(0, 7) // Extracting the "YYYY-MM" part of the date
            const existingWorkload = workloadPerMonth.get(month) ?? 0

            const workload = Array.from(shifts).map((shiftName) => {
                const shiftSpec = spec.shifts.get(shiftName)

                if (shiftSpec == null) throw Error(`Unable to find shift specification for ${shiftName}!`)

                return shiftSpec.workload
            }).reduce(sum)

            workloadPerMonth.set(month, existingWorkload + workload);
        });

        return months.map((month) => ({ worker: workerName, month, workload: workloadPerMonth.get(month)! }))
    })
}
