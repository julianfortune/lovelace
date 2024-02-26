import { Option } from "fp-ts/lib/Option"

// === Genetics ===

export type BinaryOptimizationProblem<T> = {
    chromosomeSizes: number[], // should be 'int' specifically
    serializer: GenomeSerializable<T>
    evaluate: (t: T) => Option<number>
}

export type Gene = ArrayBuffer
export type Chromosome = Gene[]
export type Genome = Chromosome[]


export type ChromosomeSerializable<T> = {
    readonly encode: (value: T) => [Chromosome, (chromosome: Chromosome) => T]
}

export type GenomeSerializable<T> = {
    readonly encode: (value: T) => [Genome, (genome: Genome) => T]
}

// === Functions ===

// const findAllCandidatesInSchedule = (schedule: Schedule): Set<string> => new Set(A.flatMap((s: ShiftAssignment): string => s.values())(valuesToArray(schedule)))

// export const ScheduleGenomeSerializable: GenomeSerializable<Schedule> = {
//     encode: function (schedule: Schedule): Genome {
//         const workers = findAllCandidatesInSchedule(schedule)

//         const decode: (genome: Genome) => Schedule = (genome) => {
//             throw Error("Not implemented")
//             return new Map()
//         }

//         const c: Chromosome = []

//         return [c, decode] as const
//     }
// }

// [ 0 1 1 0 0 ]   [ 0 0 1 ]
