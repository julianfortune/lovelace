export type DateString = string // e.g., "2024-01-01"
export type ShiftName = string
export type WorkerName = string

export type ConstraintViolation = {
    hard: boolean
    penalty: number
    message: string
}

export type WorkloadEvaluation = {
    worker: WorkerName,
    month: string,
    workload: number
}

export type OptimizationParameters = {
    maxSteps: number
}

export type ConstraintParameters = {
    backupWorkerCost: number,
    overlappingShiftsCost: number,
    insufficientRestCost: number
}
