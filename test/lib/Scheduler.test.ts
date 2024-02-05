import cases from "jest-in-case";
import { evaluateSchedule } from '../../src/lib/Scheduler'
import * as O from 'fp-ts/lib/Option'

describe('evaluateSchedule', () => {
    cases('Scores correctly', opts => {
        expect(evaluateSchedule(opts.spec, opts.schedule)).toEqual(opts.score)
    }, {
        'Basic': {
            schedule: new Map([
                ["Shift A", new Map([
                    ["2024-02-01", ["Julian"]]
                ])]
            ]),
            spec: {
                workers: [
                    { name: "Julian", availability: new Set(["2024-02-01"]) }
                ],
                shifts: [{
                    name: "Shift A",
                    occurrences: new Map([
                        ["2024-02-01", 1]
                    ]),
                    candidates: new Set(["Julian"])
                }]
            },
            score: O.some(0)
        },
    });
});
