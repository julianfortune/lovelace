import cloneDeep from "lodash.clonedeep"
import { chooseRandomElements, getRandomElement, getRandomElementWithIndex } from "../util"
import { WorkerName } from "../types/common"
import { ScheduleSpecification } from "../types/specification"
import { Schedule, ScheduleEntry } from "../types/schedule"
import { SimulatedAnnealing } from "simulated-annealing-ts"
import { evaluateSchedule, getSchedulePenalty } from "./evaluation"


export function createRandomSchedule(specification: ScheduleSpecification): Schedule {
    return Array.from(specification.shifts.entries()).flatMap(([shift, shiftSpecification]) => {
        return Array.from(shiftSpecification.occurrences.entries()).map(([date, occurrenceSpecification]) => {
            const possibleWorkers = findAlternateWorkers({ shift, date, workers: new Set() }, specification)

            var workers = new Set(possibleWorkers)
            if (possibleWorkers.length > occurrenceSpecification.maxWorkerCount) {
                workers = new Set(chooseRandomElements(possibleWorkers, occurrenceSpecification.maxWorkerCount))
            }

            return { shift, date, workers } // as ScheduleEntry
        })
    })
}

enum Operation {
    Add = 'add',
    Remove = 'remove',
    Swap = 'swap'
}

export function getRandomOperation(
    currentWorkerCount: number,
    maxWorkerCount: number,
    alternateWorkerCount: number,
): Operation {
    // Decide what operation to perform (add, remove, swap)
    switch (currentWorkerCount) {
        case 0:
            return Operation.Add
        case maxWorkerCount:
            if (alternateWorkerCount == 0) {
                return Operation.Remove
            } else {
                return getRandomElement([Operation.Swap, Operation.Remove])
            }
        default:
            if (alternateWorkerCount == 0) {
                return Operation.Remove
            } else {
                return getRandomElement([Operation.Swap, Operation.Remove, Operation.Add])
            }
    }
}

export function performOperation(
    operation: Operation, currentWorkers: Set<WorkerName>, alternateWorkers: Array<WorkerName>
): Set<WorkerName> {
    // Decide what operation to perform (add, remove, swap)
    switch (operation) {
        case Operation.Add: {
            return currentWorkers.add(getRandomElement(alternateWorkers))
        }
        case Operation.Remove: {
            const removed = getRandomElement(Array.from(currentWorkers))
            // TODO: THis is stupid
            return new Set(Array.from(currentWorkers).filter((x) => x != removed))
        }
        case Operation.Swap: {
            // First remove a random from `currentWorkers`
            const culledWorkers = performOperation(Operation.Remove, currentWorkers, alternateWorkers)
            // Then add random from `alternateWorkers`
            return performOperation(Operation.Add, culledWorkers, alternateWorkers)
        }
    }
}

// Finds workers that are:
// - candidates for the shift
// - available
// - not already assigned
// (doesn't check if the worker is assigned to other shifts on the same day)
export function findAlternateWorkers(
    scheduleEntry: ScheduleEntry,
    spec: ScheduleSpecification
): WorkerName[] {
    const shiftSpec = spec.shifts.get(scheduleEntry.shift)
    if (shiftSpec == undefined) { throw Error(`Unable to find specification for shift ${scheduleEntry.shift}`) }

    const allCandidates = Array.from(shiftSpec.candidates)

    return allCandidates.filter((c: WorkerName) => {
        const availability = spec.workers.get(c)?.availability
        if (availability == undefined) { throw Error(`No availability found for ${c}`) }

        return availability.has(scheduleEntry.date) && !scheduleEntry.workers.has(c)
    })
}

// TODO: Figure out which `ScheduleEntry`s have alternate workers available before optimizing; use that
// array to pick a random scheduleEntry (prevents retries and allows erroring gracefully if nothing can be optimized)
export function getRandomAdjacentSchedule(spec: ScheduleSpecification, initial: Schedule): Schedule {
    // Pick random entry in schedule
    const [scheduleEntry, scheduleIndex] = getRandomElementWithIndex(initial)

    // Identify the current and possible workers
    const currentWorkers = scheduleEntry.workers
    const alternateWorkers = findAlternateWorkers(scheduleEntry, spec)

    if (alternateWorkers.length == 0) {
        console.log(`No alternate workers available for ${scheduleEntry.shift} on ${scheduleEntry.date}, trying again...`)

        // Try again
        return getRandomAdjacentSchedule(spec, initial)
    } else {
        const updatedWorkers = performOperation(Operation.Swap, currentWorkers, alternateWorkers)

        // Create copy that replaces the current schedule entry with updated workers
        const newSchedule = cloneDeep(initial)
        newSchedule[scheduleIndex] = { shift: scheduleEntry.shift, date: scheduleEntry.date, workers: updatedWorkers }

        return newSchedule
    }
}
