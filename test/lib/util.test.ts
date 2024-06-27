import { describe, expect } from '@jest/globals';
import { pairwise, toIndexMap } from '../../src/lib/util'
import cases from 'jest-in-case';

describe('toIndexMap', () => {
    cases('Creates map correctly', opts => {
        expect(toIndexMap(opts.input)).toEqual(opts.expected)
    }, {
        'Basic': { input: ["a", "b", "c"], expected: new Map([[0, "a"], [1, "b"], [2, "c"]]) },
        // Not allowed !
        // 'Heterogeneous array': { input: [{ a: true }, 3, "hello"], expected: new Map([[0, { a: true }], [1, 3], [2, "hello"]]) },
        'Empty': { input: [], expected: new Map() },
    });
});


describe('pairwise', () => {
    cases('Creates pairs correctly', opts => {
        expect(pairwise(opts.input)).toEqual(opts.expected)
    }, {
        'Basic': {
            input: ["a", "b", "c"], expected: [["a", "b"], ["b", "c"]],
        }
    });
});
