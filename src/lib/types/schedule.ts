import { DateString, ShiftName, WorkerName } from "./common"

export type ScheduleEntry = { shift: ShiftName, date: DateString, workers: Set<WorkerName> }
