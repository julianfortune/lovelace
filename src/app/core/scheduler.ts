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
    inputs: SchedulerParameters,
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

        // TODO: Function to do some sanity checks ...

        const initial = createRandomSchedule(scheduleSpecification)

        const schedule = SimulatedAnnealing.run(
            initial,
            (state) => getSchedulePenalty(scheduleSpecification, state),
            (state) => getRandomAdjacentSchedule(scheduleSpecification, state),
            { maxSteps: 4000 }
        )

        // TODO: Separate function to gather auxiliary results
        const constraintViolations = evaluateSchedule(scheduleSpecification, schedule)

        return {
            success: true,
            schedule,
            constraintViolations,
            workloadEvaluations: [] // TODO
        }
    }
}
