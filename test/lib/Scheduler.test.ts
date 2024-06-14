import cases from "jest-in-case";
import { ShiftSpecification, WorkerSpecification, evaluateSchedule, evaluateWorkerAssignments, findWorkerSchedule, getRandomAdjacentSchedule } from '../../src/lib/Scheduler'
import { objToMap } from "../../src/lib/util";

describe('evaluateSchedule', () => {
    cases('Scores correctly', opts => {
        expect(evaluateSchedule(opts.spec, opts.schedule)).toEqual(opts.score)
    }, {
        'Basic': {
            schedule: new Map([
                ["Shift A", new Map([
                    ["2024-02-01", new Set(["Julian"])]
                ])]
            ]),
            spec: {
                workers: new Map([
                    ["Julian", { availability: new Set(["2024-02-01"]) } as WorkerSpecification],
                    ["Ada", { availability: new Set(["2024-02-01"]) } as WorkerSpecification]
                ]),
                shifts: new Map([
                    ["Shift A", {
                        occurrences: [{ date: "2024-02-01", count: 1 }],
                        candidates: new Set(["Julian"])
                    } as ShiftSpecification]
                ])
            },
            score: 0
        },
    });
});



describe('evaluateWorkerAssignments', () => {
    cases('Returns correct score', opts => {
        expect(evaluateWorkerAssignments(opts.assignments, opts.availability)).toEqual(opts.expected)
    }, {
        'Unavailable': {
            assignments: new Map([
                ["2024-02-02", new Set(["Shift A"])]
            ]),
            availability: new Set("2024-02-01"),
            expected: 1
        },
        'Conflicts': {
            assignments: new Map([
                ["2024-02-01", new Set(["Shift A", "Shift B"])]
            ]),
            availability: new Set("2024-02-01"),
            expected: 2 // TODO(Later): Revisit this..?
        },
        'Complex': {
            assignments: new Map([
                ["2024-02-01", new Set(["Shift A", "Shift B"])],
                ["2024-02-02", new Set(["Shift B"])]
            ]),
            availability: new Set("2024-02-01"),
            expected: 3
        },
    });
});



describe('findWorkerSchedule', () => {
    cases('Returns correct shifts', opts => {
        expect(findWorkerSchedule(opts.schedule, "Julian")).toEqual(opts.expected)
    }, {
        'Simple': {
            schedule: new Map([
                ["Shift A", new Map([
                    ["2024-02-01", new Set(["Julian"])]
                ])]
            ]),
            expected: new Map([
                ["2024-02-01", new Set(["Shift A"])]
            ])
        },
        'Complex': {
            schedule: new Map([
                ["Shift A", objToMap({ "2024-02-01": new Set(["Julian", "Ada"]) })],
                ["Shift B", objToMap({
                    "2024-01-02": new Set(["Ada"]),
                    "2024-02-01": new Set(["Julian", "Ada"])
                }),]
            ]),
            expected: new Map([
                ["2024-02-01", new Set(["Shift A", "Shift B"])]
            ])
        },
    });
});



describe('getRandomAdjacentSchedule', () => {
    cases('Results in different workers', opts => {
        expect(
            getRandomAdjacentSchedule(opts.spec, opts.schedule)
        ).toEqual(undefined)
    }, {
        'Basic': {
            schedule: new Map([
                ["Shift A", new Map([
                    ["2024-02-01", new Set(["Julian"])]
                ])]
            ]),
            spec: {
                workers: new Map([
                    ["Julian", { availability: new Set(["2024-02-01"]) } as WorkerSpecification],
                    ["Ada", { availability: new Set(["2024-02-01"]) } as WorkerSpecification]
                ]),
                shifts: new Map([
                    ["Shift A", {
                        occurrences: [{ date: "2024-02-01", count: 1 }],
                        candidates: new Set(["Julian", "Ada"])
                    } as ShiftSpecification]
                ])
            },
        },
    });
});
