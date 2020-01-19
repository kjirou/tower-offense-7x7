import * as assert from 'assert'
import {describe, it} from 'mocha'

import {
  BattleFieldElement,
  BattleFieldMatrix,
  GlobalMatrixPosition,
  MatrixPosition,
  createBattleFieldMatrix,
  findBattleFieldElementsByDistance,
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
        const fromPosition: MatrixPosition = {
          y: from[0],
          x: from[1],
        }
        const toPosition: MatrixPosition = {
          y: to[0],
          x: to[1],
        }
        assert.strictEqual(measureDistance(fromPosition, toPosition), distance)
      })
    })
  })

  describe('findBattleFieldElementsByDistance', function() {
    // +-+-+-+
    // | |0| |
    // +-+-+-+
    // |1|S|3| (S == 2)
    // +-+-+-+
    // | |4| |
    // +-+-+-+
    it('can find elements within 1 or less than 1 distance', function() {
      const matrix = createBattleFieldMatrix(3, 3)
      const elements = findBattleFieldElementsByDistance(matrix, matrix[1][1].position, 1)
      assert.strictEqual(elements[0].position.y, 0)
      assert.strictEqual(elements[0].position.x, 1)
      assert.strictEqual(elements[1].position.y, 1)
      assert.strictEqual(elements[1].position.x, 0)
      assert.strictEqual(elements[2].position.y, 1)
      assert.strictEqual(elements[2].position.x, 1)
      assert.strictEqual(elements[3].position.y, 1)
      assert.strictEqual(elements[3].position.x, 2)
      assert.strictEqual(elements[4].position.y, 2)
      assert.strictEqual(elements[4].position.x, 1)
    })

    // +-+-+-+
    // | | |0|
    // +-+-+-+
    // | |1|2|
    // +-+-+-+
    // |3|4|S| (S == 5)
    // +-+-+-+
    it('can find elements within 2 or less than 2 distances', function() {
      const matrix = createBattleFieldMatrix(3, 3)
      const elements = findBattleFieldElementsByDistance(matrix, matrix[2][2].position, 2)
      assert.strictEqual(elements[0].position.y, 0)
      assert.strictEqual(elements[0].position.x, 2)
      assert.strictEqual(elements[1].position.y, 1)
      assert.strictEqual(elements[1].position.x, 1)
      assert.strictEqual(elements[2].position.y, 1)
      assert.strictEqual(elements[2].position.x, 2)
      assert.strictEqual(elements[3].position.y, 2)
      assert.strictEqual(elements[3].position.x, 0)
      assert.strictEqual(elements[4].position.y, 2)
      assert.strictEqual(elements[4].position.x, 1)
      assert.strictEqual(elements[5].position.y, 2)
      assert.strictEqual(elements[5].position.x, 2)
    })

    // +-+-+
    // |S|1| (S == 0)
    // +-+-+
    // |2|3|
    // +-+-+
    it('should sort in the order `y` then sort in the order `x`', function() {
      const matrix = createBattleFieldMatrix(2, 2)
      const elements = findBattleFieldElementsByDistance(matrix, matrix[0][0].position, 99)
      assert.strictEqual(elements[0].position.y, 0)
      assert.strictEqual(elements[0].position.x, 0)
      assert.strictEqual(elements[1].position.y, 0)
      assert.strictEqual(elements[1].position.x, 1)
      assert.strictEqual(elements[2].position.y, 1)
      assert.strictEqual(elements[2].position.x, 0)
      assert.strictEqual(elements[3].position.y, 1)
      assert.strictEqual(elements[3].position.x, 1)
    })
  })
})
