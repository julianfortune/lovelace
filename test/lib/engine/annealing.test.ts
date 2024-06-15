import cases from "jest-in-case";
import { getRandomAdjacentSchedule } from '../../../src/lib/engine/annealing'
import { findWorkerSchedule } from '../../../src/lib/engine/evaluation'
import { objToMap } from "../../../src/lib/util";
import { ShiftSpecification, WorkerSpecification } from "../../../src/lib/types/specification";

describe('findWorkerSchedule', () => {
    cases('Returns correct shifts', opts => {
        expect(findWorkerSchedule(opts.schedule, "Julian")).toEqual(opts.expected)
    }, {
        'Simple': {
            schedule: [
                { shift: "Shift A", date: "2024-02-01", workers: new Set(["Julian"]) },
            ],
            expected: new Map([
                ["2024-02-01", new Set(["Shift A"])]
            ])
        },
        'Complex': {
            schedule: [
                { shift: "Shift A", date: "2024-02-01", workers: new Set(["Julian", "Ada"]) },
                { shift: "Shift B", date: "2024-01-02", workers: new Set(["Ada"]) },
                { shift: "Shift B", date: "2024-02-01", workers: new Set(["Julian", "Ada"]) },
            ],
            expected: new Map([
                ["2024-02-01", new Set(["Shift A", "Shift B"])]
            ])
        },
    });
});

describe('getRandomAdjacentSchedule', () => {
    cases('Results in different workers', opts => {
        expect(
            getRandomAdjacentSchedule(opts.spec, opts.schedule)[0].workers
        ).not.toEqual(new Set(["Julian"]))
    }, {
        'Basic': {
            schedule: [
                { shift: "Shift A", date: "2024-02-01", workers: new Set(["Julian"]) },
            ],
            spec: {
                workers: new Map([
                    ["Julian", { availability: new Set(["2024-02-01"]) } as WorkerSpecification],
                    ["Ada", { availability: new Set(["2024-02-01"]) } as WorkerSpecification]
                ]),
                shifts: new Map([
                    ["Shift A", {
                        occurrences: objToMap({
                            "2024-02-01": { maxWorkerCount: 1 }
                        }),
                        candidates: new Set(["Julian", "Ada"])
                    } as ShiftSpecification]
                ])
            },
        },
    });
});
