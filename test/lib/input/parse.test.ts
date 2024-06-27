import cases from "jest-in-case"
import { findAllDateStrings, findDatesEveryWeek, incrementByAWeek } from "../../../src/lib/input/parse"
import { DatePattern } from "../../../src/lib/input/types/ScheduleInputsV1"
import { toDateString } from "../../../src/lib/util"

describe('incrementByAWeek', () => {
    cases('Returns correct day', opts => {
        expect(toDateString(incrementByAWeek(opts.date))).toEqual(opts.expected)
    }, {
        'Simple': {
            date: new Date("2024-01-01"),
            expected: "2024-01-08"
        },
    })
})

describe('findDatesEveryWeek', () => {
    cases('Returns correct day', opts => {
        expect(
            findDatesEveryWeek(opts.start, opts.end).map((x) => { return toDateString(x) })
        ).toEqual(opts.expected)
    }, {
        'Simple': {
            start: new Date("2024-01-01"),
            end: new Date("2024-01-31"),
            expected: ["2024-01-01", "2024-01-08", "2024-01-15", "2024-01-22", "2024-01-29"]
        },
    })
})

// describe('findAllDateStrings', () => {
//     cases('Returns correct dates', opts => {
//         expect(findAllDateStrings(opts.start, opts.end, opts.pattern)).toEqual(opts.expected)
//     }, {
//         'Simple': {
//             start: new Date("2024-01-04"),
//             end: new Date("2024-01-08"),
//             pattern: {
//                 weekDays: ["M", "F"],
//                 including: [],
//                 excluding: []
//             } as DatePattern,
//             expected: new Set(["2024-01-05", "2024-01-08"])
//         },
//         'Complex': {
//             start: new Date("2024-01-01"),
//             end: new Date("2024-01-31"),
//             pattern: {
//                 weekDays: ["M", "F"],
//                 including: [new Date("2024-01-11"), new Date("2024-01-25")],
//                 excluding: [new Date("2024-01-15"), new Date("2024-01-29")]
//             } as DatePattern,
//             expected: new Set([
//                 "2024-01-01",
//                 "2024-01-05",
//                 "2024-01-08",
//                 "2024-01-11",
//                 "2024-01-12",
//                 "2024-01-19",
//                 "2024-01-22",
//                 "2024-01-25",
//                 "2024-01-26",
//             ])
//         },
//     })
// })
