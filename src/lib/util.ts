import { DateString } from "./types/common";

export function toIndexMap<T>(arr: Array<T>): Map<number, T> {
    return new Map((arr.map((value, index) => [index, value])))
}

export const mapToArray = <K, A>(map: Map<K, A>) => [...map.entries()]

export const valuesToArray = <K, A>(map: Map<K, A>) => [...map.values()]

export const objToMap = <A>(o: { [s: string]: A; }) => new Map(Object.entries(o))

export function getRandomEntry<K, V>(map: Map<K, V>): [K, V] {
    if (map.size == 0) { throw Error("Map must not be empty!") }

    const entries = Array.from(map.entries());
    const randomIndex = Math.floor(Math.random() * entries.length);
    return entries[randomIndex];
}

export function getRandomElement<A>(arr: Array<A>): A {
    if (arr.length == 0) { throw Error("Array must not be empty!") }

    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

export function getRandomElementWithIndex<A>(arr: Array<A>): [A, number] {
    if (arr.length == 0) { throw Error("Array must not be empty!") }

    const randomIndex = Math.floor(Math.random() * arr.length);
    return [arr[randomIndex], randomIndex];
}

export const chooseRandomElements = <T>(arr: T[], n: number): T[] => {
    if (n > arr.length) { throw Error("Array must have length greater than 'n'") }

    const shuffled = Array.from(arr).sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

// Utility function to convert Date to DateString
export const toDateString = (date: Date): DateString => date.toISOString().split('T')[0];
