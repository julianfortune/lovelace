import { DateString } from "./types/common";

export function toIndexMap<T>(arr: Array<T>): Map<number, T> {
    return new Map((arr.map((value, index) => [index, value])))
}

export const sum = (a: number, b: number) => a + b

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

export function concatenateSet(inputSet: Set<string>): string {
    let concatenatedString = '';
    Array.from(inputSet).forEach((str, index, arr) => {
        concatenatedString += str;
        if (index < arr.length - 1) {
            concatenatedString += ', ';
        }
    });
    return concatenatedString;
}

// Utility function to convert Date to DateString
export const toDateString = (date: Date): DateString => date.toISOString().split('T')[0];

// Helper function to parse date strings into Date objects
export function parseDate(dateStr: DateString): Date {
    return new Date(dateStr);
}

// Helper function to get the number of days between two dates
export function daysBetween(d1: Date, d2: Date): number {
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function pairwise<T>(arr: T[]): [T, T][] {
    if (arr.length < 2) throw Error()

    return arr.slice(0, -1).map((x, i) => [x, arr[i + 1]])
}

export function daysBetweenEach(dates: Date[]): number[] {
    return pairwise(dates).map(([first, second]) => {
        return daysBetween(first, second)
    })
}
