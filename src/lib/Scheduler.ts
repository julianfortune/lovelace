// === Input ===

import { toMap } from "fp-ts/lib/ReadonlyMap"
import { toIndexMap } from "./util"

interface ScheduleInput {
    workers: string[]
    workerAvailability: Map<Date, string[]>  // date -> available workers
    shifts: Shift[]
}

interface Shift {
    name: string

    // The days on which the shift occurs and the number of workers required
    occurrences: Map<Date, number>

    // Maybe this should be specified as Map < worker -> 'weight' > ?
    candidates: string[]
}


// === Output ===

interface Schedule {
    shifts: AssignedShift[]
}

interface AssignedShift {
    name: string
    //              date -> [workers]
    assignments: Map<Date, string[]>
}


// === Genetics ===

type Gene = ArrayBuffer
type Chromosome = Gene[] // [ (Mon Feb 4--DVP)  ]

// ChromoSer
type ChromosomeSerializable<T> = {
    toChromosome: ()
}

// === Functions ===

function createEncoding(input: ScheduleInput): readonly [Chromosome, (c: Chromosome) => Schedule] {
    // Create employee bitmap mapping: index -> worker
    const workerGeneMap = toIndexMap(input.workers)

    // Create map: index -> (shift, date, |candidates|)
    const shiftChromosomeMap = toIndexMap(input.shifts.flatMap((shift) => {
        return [...shift.occurrences.entries()].map(([date, _]) => {
            return [{ name: shift.name, date, candidates: shift.candidates }]
        })
    }))

    const decode: (c: Chromosome) => Schedule = (c) => {
        return { shifts: [] }
    }

    const c: Chromosome = []

    return [c, decode] as const
}
