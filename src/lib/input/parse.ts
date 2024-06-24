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
            const availability: Set<DateString> = new Set(
                (worker.availability ?? []).map(date => toDateString(date))
            );
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
                shift.schedule.map(date => {
                    const dateString = toDateString(date);
                    const maxWorkerCount = 1; // TODO: Make configurable
                    return [dateString, { maxWorkerCount }];
                })
            );

            const candidates = new Set(shift.primary.concat(shift.backup ?? []));
            const backup = new Set(shift.backup ?? [])

            return [shift.name, { occurrences, candidates, backup, workload: shift.workload }];
        })
    );

    return { workers: workersMap, shifts: shiftsMap };
}
