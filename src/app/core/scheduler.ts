import { SimulatedAnnealing } from "simulated-annealing-ts"
import { convertYamlScheduleInputsV1ToScheduleSpecification, parseYamlScheduleInputsV1 } from "../../lib/input/parse"
import { createRandomSchedule, getRandomAdjacentSchedule } from "../../lib/optimization/annealing"
import { evaluateSchedule, getScheduleTotalCost, getTotalCost } from "../../lib/optimization/evaluation"
import { ConstraintParameters, ConstraintViolation, OptimizationParameters, WorkloadEvaluation } from "../../lib/types/common"
import { ScheduleEntry } from "../../lib/types/schedule"
import { getWorkloadEvaluations } from "../../lib/metrics"


export type SchedulerParameters = {
    constraintParameters: ConstraintParameters
    optimizationParameters: OptimizationParameters
}

export type Schedule = {
    entries: ScheduleEntry[]
    start: Date
    end: Date
    holidays: Date[]
}

export type Evaluation = {
    totalCost: number
    constraintViolations: ConstraintViolation[]
}

export type ScheduleData = {
    title: string
    schedule: Schedule
    evaluation: Evaluation
    workloadEvaluations: WorkloadEvaluation[]
}

export type SchedulerResult = {
    success: true
    data: ScheduleData
} | {
    success: false,
    errorMessage: string
}

export function generateSchedule(
    file: File | null | undefined,
    parameters: SchedulerParameters,
    callback: (result: SchedulerResult) => void
) {
    const reader = new FileReader()
    if (file == null || file == undefined) {
        callback({ success: false, errorMessage: "No file selected!" })
        return
    }

    reader.readAsText(file)
    reader.onload = (e) => {
        const fileContents = e.target?.result?.toString() ?? ""
        const scheduleInputs = parseYamlScheduleInputsV1(fileContents)

        if (scheduleInputs.success != true) {
            callback({ success: false, errorMessage: `Parsing failed: ${scheduleInputs.error.message}` })
            return
        }

        const scheduleSpecification = convertYamlScheduleInputsV1ToScheduleSpecification(scheduleInputs.data)

        // TODO: Do some sanity checks ...

        const entries = SimulatedAnnealing.run(
            createRandomSchedule(scheduleSpecification),
            (state) => getScheduleTotalCost(scheduleSpecification, parameters.constraintParameters, state),
            (state) => getRandomAdjacentSchedule(scheduleSpecification, state),
            { maxSteps: parameters.optimizationParameters.maxSteps }
        )

        const schedule: Schedule = {
            entries,
            holidays: scheduleInputs.data.holidays,
            start: scheduleInputs.data.start,
            end: scheduleInputs.data.end,
        }

        // Gather auxiliary results
        const constraintViolations = evaluateSchedule(
            scheduleSpecification, parameters.constraintParameters, entries
        )
        const totalCost = getTotalCost(constraintViolations)

        const evaluation: Evaluation = {
            totalCost,
            constraintViolations
        }

        const workloadEvaluations = getWorkloadEvaluations(scheduleSpecification, entries)

        callback({
            success: true,
            data: {
                title: scheduleInputs.data.title,
                schedule,
                evaluation,
                workloadEvaluations
            }
        })
        return
    }
}
