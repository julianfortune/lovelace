import cloneDeep from "lodash.clonedeep"
import { getRandomElement, getRandomElementWithIndex } from "../util"
import { WorkerName } from "../types/common"
import { ScheduleSpecification } from "../types/specification"
import { Schedule } from "../types/schedule"


// export function createInitialSchedule(spec: ScheduleSpecification): Schedule {

// }

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

export function getRandomAdjacentSchedule(spec: ScheduleSpecification, initial: Schedule): Schedule {
    // Pick random entry in schedule
    const [scheduleEntry, scheduleIndex] = getRandomElementWithIndex(initial)

    const shiftSpec = spec.shifts.get(scheduleEntry.shift)
    if (shiftSpec == undefined) { throw Error(`Unable to find specification for shift ${scheduleEntry.shift}`) }
    const maxWorkerCount = shiftSpec.occurrences.get(scheduleEntry.date)?.maxWorkerCount
    if (maxWorkerCount == undefined) { throw Error(`Unable to find occurrence specification for date ${scheduleEntry.date}`) }

    // Figure out the current and possible workers
    const currentWorkers = scheduleEntry.workers

    const alternateWorkers = Array.from(shiftSpec.candidates).filter((c: WorkerName) => {
        const availability = spec.workers.get(c)?.availability
        if (availability == undefined) { throw Error(`No availability found for ${c}`) }

        return availability.has(scheduleEntry.date) && !currentWorkers.has(c)
    })

    const operation = getRandomOperation(currentWorkers.size, maxWorkerCount, alternateWorkers.length)

    const updatedWorkers = performOperation(operation, currentWorkers, alternateWorkers)

    // Create copy that replaces the current schedule entry with updated workers
    const newSchedule = cloneDeep(initial)
    newSchedule[scheduleIndex] = { shift: scheduleEntry.shift, date: scheduleEntry.date, workers: updatedWorkers }

    return newSchedule
}
