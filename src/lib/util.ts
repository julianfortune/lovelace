export function toIndexMap<T>(arr: Array<T>): Map<number, T> {
    return new Map((arr.map((value, index) => [index, value])))
}

// Utilities for working with (key, value) maps
export const mapToArray = <K, A>(map: Map<K, A>) => [...map.entries()]
export const valuesToArray = <K, A>(map: Map<K, A>) => [...map.values()]
