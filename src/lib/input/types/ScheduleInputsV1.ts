import { z } from "zod"

export const WeekDaySchema = z.union([
    z.literal("M"),
    z.literal("Tu"),
    z.literal("W"),
    z.literal("Th"),
    z.literal("F"),
])

export type WeekDay = z.infer<typeof WeekDaySchema>

export const DatePatternSchema = z.object({
    weekDays: z.union([
        z.array(WeekDaySchema),
        z.literal("All")
    ]).default([]),
    excluding: z.array(z.date()).default([]),
    including: z.array(z.date()).default([]),
})

export const WorkerInputSchema = z.object({
    name: z.string(),
    availability: DatePatternSchema,
    targetWorkload: z.number(),
})

export const ShiftInputSchema = z.object({
    name: z.string(),
    workload: z.number(),
    schedule: DatePatternSchema,
    primary: z.array(z.string()),
    backup: z.array(z.string()).optional().default([]),
})

export const ScheduleInputsV1Schema = z.object({
    version: z.literal(1),
    title: z.string(),
    start: z.date(),
    end: z.date(),
    holidays: z.array(z.date()).optional().default([]),
    workers: z.array(WorkerInputSchema),
    shifts: z.array(ShiftInputSchema),
})

export type DatePattern = z.infer<typeof DatePatternSchema>
export type ScheduleInputsV1 = z.infer<typeof ScheduleInputsV1Schema>
