import * as assert from 'assert';
import {describe, it} from 'mocha';

import {
  flattenMatrix,
} from '../utils';

describe('utils', function() {
  describe('flattenMatrix', function() {
    it('should flatten a 2D array to an 1D array', function() {
      assert.deepStrictEqual(
        flattenMatrix<number>([[1, 2], [3, 4]]),
        [1, 2, 3, 4],
      );
    });
  });
});
