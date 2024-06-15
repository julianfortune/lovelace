import { z } from "zod";

export enum DayOfTheWeek {
    Sunday = 'Sunday',
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday'
}

export const DayOfTheWeekSchema = z.nativeEnum(DayOfTheWeek);

export interface UserPattern {
    days: DayOfTheWeek[]
    weeks: number[] // Ignore weeks not in the month ?
}

export const UserPatternSchema = z.object({
    days: z.array(DayOfTheWeekSchema),
    weeks: z.array(z.number())
});

export interface ScheduleDefinition {
    everyday: boolean
    dates: Date[]
    patterns: UserPattern[]
    excluding: Date[]
}

export const ScheduleDefinitionSchema = z.object({
    everyday: z.boolean(),
    dates: z.array(z.date()),
    patterns: z.array(UserPatternSchema),
    excluding: z.array(z.date())
})
