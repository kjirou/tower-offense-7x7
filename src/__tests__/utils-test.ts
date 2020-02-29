import * as assert from 'assert';
import {describe, it} from 'mocha';

import {
  BattleFieldElement,
  BattleFieldMatrix,
  Card,
  MatrixPosition,
  Party,
  areGlobalPositionsEqual,
  choiceElementsAtRandom,
  createBattleFieldMatrix,
  findBattleFieldElementByCreatureId,
  findBattleFieldElementsByDistance,
  findCardUnderCursor,
  findCardsByCreatureIds,
  findPartyByCreatureId,
  flattenMatrix,
  measureDistance,
  pickBattleFieldElementsWhereCreatureExists,
  shuffleArray,
  validateMatrix,
} from '../utils';

describe('utils', function() {
  describe('shuffleArray', function() {
    it('乱数を偏らせたときに結果が異なる', function() {
      const array = [1, 2]
      const a = shuffleArray<Number>(array, () => 0.0)
      const b = shuffleArray<Number>(array, () => 1.0)
      assert.notDeepStrictEqual(a, b)
    })

    it('[1, 2, 3, 4, 5] に対して 1000 回実行したときに、結果内で 1 が全ての位置へ 1 つは存在している', function() {
      // NOTE: この結果が偶然失敗するのは以下の確率である。
      //       Math.pow(0.8, 1000) * 5 === 1.2302319221611854e-97 * 5
      const results = Array.from({length: 1000}).map(() => shuffleArray([1, 2, 3, 4, 5], Math.random))
      let oneIn1st = false
      let oneIn2nd = false
      let oneIn3rd = false
      let oneIn4th = false
      let oneIn5th = false
      for (const result of results) {
        if (result[0] === 1) {
          oneIn1st = true
        }
        if (result[1] === 1) {
          oneIn2nd = true
        }
        if (result[2] === 1) {
          oneIn3rd = true
        }
        if (result[3] === 1) {
          oneIn4th = true
        }
        if (result[4] === 1) {
          oneIn5th = true
        }
      }
      assert.strictEqual(oneIn1st, true)
      assert.strictEqual(oneIn2nd, true)
      assert.strictEqual(oneIn3rd, true)
      assert.strictEqual(oneIn4th, true)
      assert.strictEqual(oneIn5th, true)
    })
  })

  describe('choiceElementsAtRandom', function() {
    it('指定数の要素を返す', function() {
      const result = choiceElementsAtRandom([1, 2, 3, 4, 5], 2)
      assert.strictEqual(result.length, 2)
    })

    it('指定数が要素数を超えているときは例外を発生する', function() {
      assert.throws(() => {
        choiceElementsAtRandom([1, 2, 3, 4, 5], 6)
      }, /not enough/)
    })
  })

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
      )
    })
  })

  describe('findPartyByCreatureId', function() {
    describe('creatureId がいずれかの Party に所属するとき', function() {
      it('所属先の Party を返す', function() {
        const parties: Party[] = [
          {factionId: 'player', creatureIds: ['a']},
          {factionId: 'computer', creatureIds: ['b']},
        ]
        assert.strictEqual(findPartyByCreatureId(parties, 'b'), parties[1])
      })
    })

    describe('creatureId がどの Party にも所属しないとき', function() {
      it('例外を発生する', function() {
        assert.throws(() => {
          findPartyByCreatureId([], 'a')
        }, /creatureId/)
      })
    })
  })

  describe('areGlobalPositionsEqual', function() {
    describe('a=BattleFieldMatrixPosition, b=BattleFieldMatrixPosition', function() {
      it('can return true if args are equal', function() {
        assert.strictEqual(
          areGlobalPositionsEqual(
            {
              globalPlacementId: 'battleFieldMatrix',
              y: 1,
              x: 2,
            },
            {
              globalPlacementId: 'battleFieldMatrix',
              y: 1,
              x: 2,
            }
          ),
          true
        )
      })

      it('can return false if args are not equal', function() {
        assert.strictEqual(
          areGlobalPositionsEqual(
            {
              globalPlacementId: 'battleFieldMatrix',
              y: 1,
              x: 2,
            },
            {
              globalPlacementId: 'battleFieldMatrix',
              y: 2,
              x: 2,
            }
          ),
          false
        )
      })
    })

    describe('a=CardOnPlayersHandPosition, b=CardOnPlayersHandPosition', function() {
      it('can return true if args are equal', function() {
        assert.strictEqual(
          areGlobalPositionsEqual(
            {
              globalPlacementId: 'cardsOnPlayersHand',
              creatureId: 'foo',
            },
            {
              globalPlacementId: 'cardsOnPlayersHand',
              creatureId: 'foo',
            }
          ),
          true
        )
      })

      it('can return false if args are not equal', function() {
        assert.strictEqual(
          areGlobalPositionsEqual(
            {
              globalPlacementId: 'cardsOnPlayersHand',
              creatureId: 'foo',
            },
            {
              globalPlacementId: 'cardsOnPlayersHand',
              creatureId: 'bar',
            }
          ),
          false
        )
      })
    })

    describe('a=BattleFieldMatrixPosition, b=CardOnPlayersHandPosition', function() {
      it('can return false', function() {
        assert.strictEqual(
          areGlobalPositionsEqual(
            {
              globalPlacementId: 'cardsOnPlayersHand',
              creatureId: 'foo',
            },
            {
              globalPlacementId: 'battleFieldMatrix',
              y: 1,
              x: 2,
            }
          ),
          false
        )
      })
    })
  })

  describe('findBattleFieldElementByCreatureId', function() {
    it('works', function() {
      const matrix = createBattleFieldMatrix(3, 4)
      const destination = matrix[1][2]
      destination.creatureId = 'a'
      assert.strictEqual(findBattleFieldElementByCreatureId(matrix, 'a'), destination)
    })
  })

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

  describe('pickBattleFieldElementsWhereCreatureExists', function() {
    describe('When the `exists` argument is true', function() {
      it('can pick elements where the creature exists', function() {
        const matrix = createBattleFieldMatrix(2, 3)
        matrix[0][0].creatureId = 'a'
        matrix[1][2].creatureId = 'b'
        const elements = pickBattleFieldElementsWhereCreatureExists(matrix, true)
        assert.strictEqual(elements.length, 2)
        assert.strictEqual(elements[0].creatureId, 'a')
        assert.strictEqual(elements[1].creatureId, 'b')
      })
    })

    describe('When the `exists` argument is false', function() {
      it('can pick elements where the creature does not exist', function() {
        const matrix = createBattleFieldMatrix(2, 3)
        matrix[0][0].creatureId = 'a'
        matrix[1][2].creatureId = 'b'
        const elements = pickBattleFieldElementsWhereCreatureExists(matrix, false)
        assert.strictEqual(elements.length, 4)
      })
    })
  })

  describe('findCardsByCreatureIds', function() {
    it('should return the cards in order of creatureIds', function() {
      const cards: Card[] = [
        {
          creatureId: 'a',
          skillCategoryId: 'attack',
        },
        {
          creatureId: 'b',
          skillCategoryId: 'attack',
        },
      ]
      const found = findCardsByCreatureIds(cards, ['b', 'a'])
      assert.strictEqual(found[0].creatureId, 'b')
      assert.strictEqual(found[1].creatureId, 'a')
    })
  })

  describe('findCardUnderCursor', function() {
    it('can find a card when the cursor is on cards', function() {
      const cards: Card[] = [
        {
          creatureId: 'a',
          skillCategoryId: 'attack',
        },
        {
          creatureId: 'b',
          skillCategoryId: 'attack',
        },
        {
          creatureId: 'c',
          skillCategoryId: 'attack',
        },
      ]
      assert.strictEqual(
        findCardUnderCursor(cards, {
          globalPosition: {
            globalPlacementId: 'cardsOnPlayersHand',
            creatureId: 'b',
          },
        }),
        cards[1],
      )
    })

    it('can not find any card when the cursor is not on cards', function() {
      const cards: Card[] = [
        {
          creatureId: 'a',
          skillCategoryId: 'attack',
        },
      ]
      assert.strictEqual(
        findCardUnderCursor(cards, {
          globalPosition: {
            globalPlacementId: 'cardsOnPlayersHand',
            creatureId: 'b',
          },
        }),
        undefined,
      )
    })
  })
})
