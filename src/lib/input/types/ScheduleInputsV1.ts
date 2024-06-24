import { z } from "zod";

export const WorkerInputSchema = z.object({
    name: z.string(),
    availability: z.array(z.date()).optional().default([]),
    targetWorkload: z.number(),
})

export const ShiftInputSchema = z.object({
    name: z.string(),
    workload: z.number(),
    schedule: z.array(z.date()),
    primary: z.array(z.string()),
    backup: z.array(z.string()).optional().default([]),
})

export const ScheduleInputsV1Schema = z.object({
    version: z.literal(1),
    title: z.string(),
    holidays: z.array(z.date()).optional().default([]),
    workers: z.array(WorkerInputSchema),
    shifts: z.array(ShiftInputSchema),
})

export type ScheduleInputsV1 = z.infer<typeof ScheduleInputsV1Schema>
