// // === Genetics ===

// type Gene = ArrayBuffer
// type Chromosome = Gene[] // [ (Mon Feb 4--DVP) ]

// // ChromoSer
// type ChromosomeSerializable<T> = {
//     toChromosome: ()
// }

// // === Functions ===

// function createEncoding(input: ScheduleInput): readonly [Chromosome, (c: Chromosome) => Schedule] {
//     // Create employee bitmap mapping: index -> worker
//     const workerGeneMap = toIndexMap(input.workers)

//     // Create map: index -> (shift, date, |candidates|)
//     const shiftChromosomeMap = toIndexMap(input.shifts.flatMap((shift) => {
//         return [...shift.occurrences.entries()].map(([date, _]) => {
//             return [{ name: shift.name, date, candidates: shift.candidates }]
//         })
//     }))

//     const decode: (c: Chromosome) => Schedule = (c) => {
//         return { shifts: [] }
//     }

//     const c: Chromosome = []

//     return [c, decode] as const
// }
