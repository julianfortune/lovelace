export function toIndexMap<T>(arr: Array<T>): Map<number, T> {
    return new Map((arr.map((value, index) => [index, value])))
}

// Utilities for working with (key, value) maps
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
    if (arr.length == 0) { throw Error("Map must not be empty!") }

    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}
