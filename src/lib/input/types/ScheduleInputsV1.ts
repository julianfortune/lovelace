import { z } from "zod";

export const WorkerInputSchema = z.object({
    name: z.string(),
    availability: z.array(z.date()).optional(),
})

export const ShiftInputSchema = z.object({
    name: z.string(),
    schedule: z.array(z.date()),
    primary: z.array(z.string()),
    backup: z.array(z.string()).optional(),
})

export const ScheduleInputsV1Schema = z.object({
    version: z.literal(1),
    title: z.string(),
    holidays: z.array(z.date()).optional(),
    workers: z.array(WorkerInputSchema),
    shifts: z.array(ShiftInputSchema),
})

export type ScheduleInputsV1 = z.infer<typeof ScheduleInputsV1Schema>
