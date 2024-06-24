import { DateString, ShiftName, WorkerName } from "./common"


export interface ScheduleSpecification {
    workers: Map<WorkerName, WorkerSpecification>
    shifts: Map<ShiftName, ShiftSpecification>
}

export interface WorkerSpecification {
    availability: Set<DateString> // { "2024-02-04", "2024-02-05", ... }
    minimumRestDays: number
    targetWorkload: number // Per month
}

export interface ShiftSpecification {
    // The days on which the shift occurs and the exact number of workers required
    occurrences: Map<DateString, ShiftOccurrenceSpecification>
    candidates: Set<WorkerName>
    backup: Set<WorkerName> // Using backup worker will incur a penalty
    workload: number // Workload per shift
}

export interface ShiftOccurrenceSpecification {
    maxWorkerCount: number
}
