import * as assert from 'assert';
import {describe, it} from 'mocha';

import {
  flattenMatrix,
  validateMatrix,
} from '../utils';

describe('utils', function() {
  describe('validateMatrix', function() {
    const testCases: [any[][], boolean][] = [
      [
        [
          [1, 2],
          [3, 4],
        ],
        true,
      ],
      [
        [
          [1, 2],
        ],
        true,
      ],
      [
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        true,
      ],
      [
        [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
        true,
      ],
      [
        [
          [1],
        ],
        true,
      ],
      [
        [],
        false,
      ],
      [
        [
          [],
        ],
        false,
      ],
      [
        [
          [1, 2],
          [3],
        ],
        false,
      ],
    ];
    testCases.forEach(([matrix, expected]) => {
      const matrixString = '[' + matrix.map(row => `[${row}]`) + ']';
      it(`${matrixString} => ${expected}`, function() {
        assert.strictEqual(validateMatrix<any>(matrix), expected);
      });
    });
  });

  describe('flattenMatrix', function() {
    it('should flatten a 2D array to an 1D array', function() {
      assert.deepStrictEqual(
        flattenMatrix<number>([[1, 2], [3, 4]]),
        [1, 2, 3, 4],
      );
    });
  });
});
