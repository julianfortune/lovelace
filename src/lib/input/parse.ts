import { DateString, ShiftName, WorkerName } from '../types/common';
import { ScheduleSpecification, ShiftOccurrenceSpecification, ShiftSpecification, WorkerSpecification } from '../types/specification';
import { toDateString } from '../util';
import { DatePattern, ScheduleInputsV1, WeekDay } from "./types/ScheduleInputsV1";

let dayInMs = 24 * 60 * 60 * 1000
let weekInMs = (7 * dayInMs)

export function incrementByAWeek(current: Date): Date {
    return new Date(current.getTime() + weekInMs)
}

export function addDays(current: Date, days: number): Date {
    return new Date(current.getTime() + (days * dayInMs))
}

export function findDatesEveryWeek(start: Date, end: Date): Date[] {
    if (start.getTime() > end.getTime()) {
        return []
    } else {
        return [start].concat(findDatesEveryWeek(incrementByAWeek(start), end))
    }
}

let weekDayToDayNumber: Map<WeekDay, number> = new Map([
    ["M", 1],
    ["Tu", 2],
    ["W", 3],
    ["Th", 4],
    ["F", 5],
])

export function findDatesForDaysOfTheWeek(start: Date, end: Date, weekDays: WeekDay[]): Date[] {
    let startingDayNumber = start.getUTCDay() // `DateString`s are treated by `Date` as midnight in UTC

    return weekDays.flatMap((day) => {
        let dayNumber = weekDayToDayNumber.get(day)!
        let diff = dayNumber - startingDayNumber
        let offset = (diff < 0) ? diff + 7 : diff
        let firstWeekDayDate = addDays(start, offset)

        return findDatesEveryWeek(firstWeekDayDate, end)
    })
}

export function findAllDateStrings(start: Date, end: Date, holidays: Date[], pattern: DatePattern): Set<DateString> {
    let dates = new Set<DateString>()

    if (pattern.weekDays !== "All" && pattern.weekDays.length > 0) {
        let datesFromWeekDays = findDatesForDaysOfTheWeek(start, end, pattern.weekDays)
        datesFromWeekDays.forEach((x) => dates.add(toDateString(x)))
    } else if (pattern.weekDays == "All") {
        let datesFromWeekDays = findDatesForDaysOfTheWeek(start, end, ["M", "Tu", "W", "Th", "F"])
        datesFromWeekDays.forEach((x) => dates.add(toDateString(x)))
    }

    pattern.including.forEach((x) => { dates.add(toDateString(x)) })
    pattern.excluding.forEach((x) => { dates.delete(toDateString(x)) })
    holidays.forEach((x) => { dates.delete(toDateString(x)) })

    return dates
}

export function convertYamlScheduleInputsV1ToScheduleSpecification(
    inputs: ScheduleInputsV1
): ScheduleSpecification {
    const workersMap: Map<WorkerName, WorkerSpecification> = new Map(
        inputs.workers.map(worker => {
            const availability = findAllDateStrings(inputs.start, inputs.end, inputs.holidays, worker.availability);
            return [worker.name, {
                availability,
                minimumRestDays: 1, // TODO: Make configurable
                targetWorkload: worker.targetWorkload
            }];
        })
    );

    const shiftsMap: Map<ShiftName, ShiftSpecification> = new Map(
        inputs.shifts.map(shift => {
            const occurrences: Map<DateString, ShiftOccurrenceSpecification> = new Map(
                Array.from(findAllDateStrings(
                    inputs.start, inputs.end, inputs.holidays, shift.schedule
                )).map(dateString => {
                    const maxWorkerCount = 1; // TODO: Make configurable
                    return [dateString, { maxWorkerCount }];
                })
            );

            const candidates = new Set(shift.primary.concat(shift.backup));
            const backup = new Set(shift.backup)

            return [shift.name, { occurrences, candidates, backup, workload: shift.workload }];
        })
    );

    return { workers: workersMap, shifts: shiftsMap };
}
