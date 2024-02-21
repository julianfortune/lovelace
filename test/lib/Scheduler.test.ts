import cases from "jest-in-case";
import { evaluateSchedule } from '../../src/lib/Scheduler'
import * as O from 'fp-ts/lib/Option'
import { set, string } from "fp-ts";

describe('evaluateSchedule', () => {
    cases('Scores correctly', opts => {
        expect(evaluateSchedule(opts.spec, opts.schedule)).toEqual(opts.score)
    }, {
        'Basic': {
            schedule: new Map([
                ["Shift A", new Map([
                    ["2024-02-01", set.fromArray(string.Eq)(["Julian"])]
                ])]
            ]),
            spec: {
                workers: [
                    { name: "Julian", availability: new Set(["2024-02-01"]) }
                ],
                shifts: [{
                    name: "Shift A",
                    occurrences: [{ date: "2024-02-01", count: 1 }],
                    candidates: new Set(["Julian"])
                }]
            },
            score: O.some(0)
        },
    });
});
