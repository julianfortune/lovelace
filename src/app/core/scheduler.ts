import { SimulatedAnnealing } from "simulated-annealing-ts"
import { convertYamlScheduleInputsV1ToScheduleSpecification, parseYamlScheduleInputsV1 } from "../../lib/input/parse"
import { createRandomSchedule, getRandomAdjacentSchedule } from "../../lib/optimization/annealing"
import { evaluateSchedule, getSchedulePenalty } from "../../lib/optimization/evaluation"
import { ConstraintParameters, ConstraintViolation, OptimizationParameters, WorkloadEvaluation } from "../../lib/types/common"
import { Schedule } from "../../lib/types/schedule"


export type SchedulerParameters = {
    constraintParameters: ConstraintParameters
    optimizationParameters: OptimizationParameters
}

export type SchedulerResult = {
    success: true
    schedule: Schedule,
    constraintViolations: ConstraintViolation[],
    workloadEvaluations: WorkloadEvaluation[]
} | {
    success: false,
    errorMessage: string
}

export function findSchedule(
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

        const schedule = SimulatedAnnealing.run(
            createRandomSchedule(scheduleSpecification),
            (state) => getSchedulePenalty(scheduleSpecification, parameters.constraintParameters, state),
            (state) => getRandomAdjacentSchedule(scheduleSpecification, state),
            { maxSteps: parameters.optimizationParameters.maxSteps }
        )

        // Gather auxiliary results
        const constraintViolations = evaluateSchedule(scheduleSpecification, parameters.constraintParameters, schedule)
        const workloadEvaluations = [] // TODO

        return {
            success: true,
            schedule,
            constraintViolations,
            workloadEvaluations
        }
    }
}
