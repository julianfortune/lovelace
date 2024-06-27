import cases from "jest-in-case";
import { evaluateSchedule } from '../../../src/lib/optimization/evaluation';
import { ShiftSpecification, WorkerSpecification } from "../../../src/lib/types/specification";
import { objToMap } from "../../../src/lib/util";

// describe('evaluateSchedule', () => {
//     cases('Scores correctly', opts => {
//         expect(evaluateSchedule(opts.spec, opts.schedule)).toEqual(opts.score)
//     }, {
//         'Basic': {
//             schedule: [
//                 { shift: "Shift A", date: "2024-02-01", workers: new Set(["Julian"]) },
//             ],
//             spec: {
//                 workers: new Map([
//                     ["Julian", { availability: new Set(["2024-02-01"]) } as WorkerSpecification],
//                     ["Ada", { availability: new Set(["2024-02-01"]) } as WorkerSpecification]
//                 ]),
//                 shifts: new Map([
//                     ["Shift A", {
//                         occurrences: objToMap({ "2024-02-01": { maxWorkerCount: 1 } }),
//                         candidates: new Set(["Julian"])
//                     } as ShiftSpecification]
//                 ])
//             },
//             score: []
//         },
//     });
// });
