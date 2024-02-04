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

// const ambiguousDayShorthands = new Set(["t", "s"])

// function validateDayOfTheWeek(val: string): boolean {
//     console.log(`parsing: ${val}`)
//     if (typeof val !== "string") {
//         return false;
//     }

//     const normalizedVal = val.toLowerCase()

//     if (ambiguousDayShorthands.has(normalizedVal)) {
//         return false; // Ambiguous
//     }

//     const matchingDay = Object.values(DayOfTheWeek).find((day) => day.toLowerCase().startsWith(normalizedVal))

//     if (matchingDay === undefined) {
//         return false; // No matching day
//     }

//     return true
// }

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
