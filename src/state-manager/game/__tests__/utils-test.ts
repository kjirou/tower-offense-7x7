import * as assert from 'assert'
import {describe, it} from 'mocha'

import {
  GlobalMatrixPosition,
  measureDistance,
} from '../utils'

describe('state-manager/game/utils', function() {
  describe('measureDistance', function() {
    const testCases: {
      from: [number, number],  // [y, x]
      to: [number, number],  // [y, x]
      distance: number,
    }[] = [
      {from: [0, 0], to: [0, 0], distance: 0},
      {from: [1, 0], to: [0, 0], distance: 1},
      {from: [0, 1], to: [0, 0], distance: 1},
      {from: [0, 0], to: [1, 0], distance: 1},
      {from: [0, 0], to: [0, 1], distance: 1},
      {from: [2, 0], to: [0, 0], distance: 2},
      {from: [0, 2], to: [0, 0], distance: 2},
      {from: [0, 0], to: [2, 0], distance: 2},
      {from: [0, 0], to: [0, 2], distance: 2},
      {from: [-1, 0], to: [0, 0], distance: 1},
      {from: [0, -1], to: [0, 0], distance: 1},
      {from: [0, 0], to: [-1, 0], distance: 1},
      {from: [0, 0], to: [0, -1], distance: 1},
      {from: [2, 3], to: [2, 3], distance: 0},
      {from: [12, 3], to: [2, 3], distance: 10},
      {from: [2, 13], to: [2, 3], distance: 10},
      {from: [2, 3], to: [12, 3], distance: 10},
      {from: [2, 3], to: [2, 13], distance: 10},
      {from: [-5, -3], to: [-5, -3], distance: 0},
      {from: [-15, -3], to: [-5, -3], distance: 10},
      {from: [-5, -13], to: [-5, -3], distance: 10},
      {from: [-5, -3], to: [-15, -3], distance: 10},
      {from: [-5, -3], to: [-5, -13], distance: 10},
      {from: [1, -2], to: [2, -2], distance: 1},
      {from: [-1, 2], to: [-2, 2], distance: 1},
    ]
    testCases.forEach(({from, to, distance}) => {
      it(`from=[${from}] to=[${to}] -> distance=${distance}`, function() {
        const fromPosition: GlobalMatrixPosition = {
          matrixId: 'battleField',
          y: from[0],
          x: from[1],
        }
        const toPosition: GlobalMatrixPosition = {
          matrixId: 'battleField',
          y: to[0],
          x: to[1],
        }
        assert.strictEqual(measureDistance(fromPosition, toPosition), distance)
      })
    })
  })
})
