export function toIndexMap<T>(arr: Array<T>): Map<number, T> {
    return new Map((arr.map((value, index) => [index, value])))
}
