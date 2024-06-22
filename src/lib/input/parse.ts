import yaml from 'js-yaml';
import { ScheduleInputsV1, ScheduleInputsV1Schema } from "./types/ScheduleInputsV1";
import { SafeParseReturnType } from 'zod';
import { ScheduleSpecification, ShiftOccurrenceSpecification, ShiftSpecification, WorkerSpecification } from '../types/specification';
import { DateString, ShiftName, WorkerName } from '../types/common';
import { toDateString } from '../util';

export function parseYamlScheduleInputsV1(
    fileContents: string
): SafeParseReturnType<unknown, ScheduleInputsV1> {
    const data = yaml.load(fileContents)
    return ScheduleInputsV1Schema.safeParse(data)
}

export function convertYamlScheduleInputsV1ToScheduleSpecification(
    inputs: ScheduleInputsV1
): ScheduleSpecification {
    const workersMap: Map<WorkerName, WorkerSpecification> = new Map(
        inputs.workers.map(worker => {
            const availabilitySet: Set<DateString> = new Set(
                (worker.availability ?? []).map(date => toDateString(date))
            );
            return [worker.name, { availability: availabilitySet }];
        })
    );

    const shiftsMap: Map<ShiftName, ShiftSpecification> = new Map(
        inputs.shifts.map(shift => {
            const occurrences: Map<DateString, ShiftOccurrenceSpecification> = new Map(
                shift.schedule.map(date => {
                    const dateString = toDateString(date);
                    // Assuming maxWorkerCount is derived from the primary workers count
                    const maxWorkerCount = shift.primary.length;
                    return [dateString, { maxWorkerCount }];
                })
            );

            const candidatesSet: Set<string> = new Set(shift.primary.concat(shift.backup ?? []));

            return [shift.name, { occurrences, candidates: candidatesSet }];
        })
    );

    return { workers: workersMap, shifts: shiftsMap };
}