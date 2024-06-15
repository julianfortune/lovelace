import { DateString, ShiftName, WorkerName } from "./common"


export interface ScheduleSpecification {
    workers: Map<WorkerName, WorkerSpecification>
    shifts: Map<ShiftName, ShiftSpecification>
}

export interface WorkerSpecification {
    availability: Set<DateString> // { "2024-02-04", "2024-02-05", ... }

    // TODO(later): Extra constraints for workers (e.g., only X days per week, only X days scheduled in a row, ...)
}

export interface ShiftSpecification {
    // The days on which the shift occurs and the exact number of workers required
    occurrences: Map<DateString, ShiftOccurrenceSpecification>

    // TODO(later): Need to make this more granular
    // - Maybe this should be specified as Map < worker -> 'weight' > ?
    // - Different lists for different levels (e.g., primary, secondary, fallback)
    candidates: Set<string>
}

export interface ShiftOccurrenceSpecification {
    maxWorkerCount: number
}
