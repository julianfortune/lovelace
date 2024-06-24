import cases from "jest-in-case";
import { evaluateSchedule, evaluateWorkerAssignments } from '../../../src/lib/optimization/evaluation'
import { objToMap } from "../../../src/lib/util";
import { ShiftSpecification, WorkerSpecification } from "../../../src/lib/types/specification";

describe('evaluateSchedule', () => {
    cases('Scores correctly', opts => {
        expect(evaluateSchedule(opts.spec, opts.schedule)).toEqual(opts.score)
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
                        occurrences: objToMap({ "2024-02-01": { maxWorkerCount: 1 } }),
                        candidates: new Set(["Julian"])
                    } as ShiftSpecification]
                ])
            },
            score: 0
        },
    });
});

// TODO: Fix
describe('evaluateWorkerAssignments', () => {
    // cases('Returns correct score', opts => {
    //     expect(evaluateWorkerAssignments(opts.assignments, opts.availability)).toEqual(opts.expected)
    // }, {
    //     'Unavailable': {
    //         assignments: new Map([
    //             ["2024-02-02", new Set(["Shift A"])]
    //         ]),
    //         availability: new Set("2024-02-01"),
    //         expected: 1
    //     },
    //     'Conflicts': {
    //         assignments: new Map([
    //             ["2024-02-01", new Set(["Shift A", "Shift B"])]
    //         ]),
    //         availability: new Set("2024-02-01"),
    //         expected: 2 // TODO(Later): Revisit this..?
    //     },
    //     'Complex': {
    //         assignments: new Map([
    //             ["2024-02-01", new Set(["Shift A", "Shift B"])],
    //             ["2024-02-02", new Set(["Shift B"])]
    //         ]),
    //         availability: new Set("2024-02-01"),
    //         expected: 3
    //     },
    // });
})
