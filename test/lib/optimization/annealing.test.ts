import cases from "jest-in-case"
import { createRandomSchedule, getRandomAdjacentSchedule } from '../../../src/lib/optimization/annealing'
import { evaluateSchedule, findWorkerSchedule, getSchedulePenalty } from '../../../src/lib/optimization/evaluation'
import { objToMap } from "../../../src/lib/util"
import { ShiftSpecification, WorkerSpecification } from "../../../src/lib/types/specification"
import { SimulatedAnnealing } from "simulated-annealing-ts"

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
    })
})

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
    })
})

describe('scripts', () => {
    const scheduleSpecification = {
        workers: new Map([
            ["Julian", { availability: new Set(["2024-02-01", "2024-02-02"]) } as WorkerSpecification],
            ["Ada", { availability: new Set(["2024-02-01"]) } as WorkerSpecification],
            ["Teddy", { availability: new Set(["2024-02-02"]) } as WorkerSpecification]
        ]),
        shifts: new Map([
            ["Shift A", {
                occurrences: objToMap({
                    "2024-02-01": { maxWorkerCount: 1 }
                }),
                candidates: new Set(["Julian", "Ada"]),
                backup: new Set(),
                workload: 1
            } as ShiftSpecification],
            ["Shift B", {
                occurrences: objToMap({
                    "2024-02-01": { maxWorkerCount: 1 }
                }),
                candidates: new Set(["Julian", "Ada"]),
                backup: new Set(),
                workload: 1
            } as ShiftSpecification],
            ["Shift C", {
                occurrences: objToMap({
                    "2024-02-02": { maxWorkerCount: 1 }
                }),
                candidates: new Set(["Julian", "Ada", "Teddy"]),
                backup: new Set(),
                workload: 1
            } as ShiftSpecification]
        ])
    }
    test('testing annealing process', () => {
        const initial = createRandomSchedule(scheduleSpecification)
        console.log(initial)

        const result = SimulatedAnnealing.run(
            initial,
            (state) => getSchedulePenalty(scheduleSpecification, state),
            (state) => getRandomAdjacentSchedule(scheduleSpecification, state)
        )

        console.log(result)
        console.log(evaluateSchedule(scheduleSpecification, result))
    })
})
