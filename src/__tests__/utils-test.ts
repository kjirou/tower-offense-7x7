import * as assert from 'assert';
import {
  beforeEach,
  describe,
  it,
} from 'mocha';

import {
  createCreature,
  createConstants,
  createJob,
  createStateDisplayBattlePageAtStartOfGame,
} from '../test-utils';
import {
  BattleFieldElement,
  BattleFieldMatrix,
  Card,
  Creature,
  Game,
  MatrixPosition,
  MatrixPositionDelta,
  Party,
  RANGE_SHAPES,
  RangeShapeFragment,
  areGlobalPositionsEqual,
  choiceElementsAtRandom,
  createBattleFieldMatrix,
  createCircularRangeForReach,
  creatureUtils,
  ensureBattlePage,
  findBattleFieldElementByCreatureId,
  findBattleFieldElementsByRange,
  findCardUnderCursor,
  findCardsByCreatureIds,
  findPartyByCreatureId,
  flattenMatrix,
  gameParameterUtils,
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

  describe('createCircularRangeForReach', function() {
    const testCases: {
      reach: number,
      positionDeltas: MatrixPositionDelta[],
    }[] = [
      {
        reach: 0,
        positionDeltas: [{y: 0, x: 0}],
      },
      {
        reach: 1,
        positionDeltas: [{y: 1, x: 0}, {y: 0, x: 1}, {y: -1, x: 0}, {y: 0, x: -1}],
      },
      {
        reach: 2,
        positionDeltas: [
          {y: 2, x: 0}, {y: 1, x: 1}, {y: 0, x: 2}, {y: -1, x: 1},
          {y: -2, x: 0}, {y: -1, x: -1}, {y: 0, x: -2}, {y: 1, x: -1},
        ],
      },
      {
        reach: 3,
        positionDeltas: [
          {y: 3, x: 0}, {y: 2, x: 1}, {y: 1, x: 2},
          {y: 0, x: 3}, {y: -1, x: 2}, {y: -2, x: 1},
          {y: -3, x: 0}, {y: -2, x: -1}, {y: -1, x: -2},
          {y: 0, x: -3}, {y: 1, x: -2}, {y: 2, x: -1},
        ],
      },
    ]
    for (const testCase of testCases) {
      it(`reach=${testCase.reach} に対する期待通りの範囲を生成する`, function() {
        assert.deepStrictEqual(createCircularRangeForReach(testCase.reach), testCase.positionDeltas)
      })
    }
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

  describe('RANGE_SHAPES', function() {
    for (const rangeShapeKey of Object.keys(RANGE_SHAPES)) {
      describe(rangeShapeKey, function() {
        let rangeShape: RangeShapeFragment[]
        beforeEach(function() {
          rangeShape = RANGE_SHAPES[rangeShapeKey]
        })

        it('断片同士が同じリーチを持たない', function() {
          const reaches = rangeShape.map(e => e.reach)
          for (const reach of reaches) {
            const count = reaches.filter(e => e === reach).length
            assert.strictEqual(count, 1)
          }
        })

        it('断片同士が同じ相対位置を持たない', function() {
          let compositePositionDeltas: {y: number, x: number}[] = []
          for (const rangeShapeFragment of rangeShape) {
            compositePositionDeltas = compositePositionDeltas.concat(rangeShapeFragment.positionDeltas)
          }
          while (compositePositionDeltas.length > 0) {
            const positionDelta = compositePositionDeltas.pop() as {y: number, x: number}
            const found = compositePositionDeltas.find(e => positionDelta.y === e.y && positionDelta.x === e.x)
            assert.strictEqual(found, undefined, `${rangeShapeKey} の ${JSON.stringify(found)} が重複している`)
          }
        })
      })
    }
  })

  describe('findBattleFieldElementsByRange', function() {
    let matrix: BattleFieldMatrix
    beforeEach(function() {
      matrix = createBattleFieldMatrix(7, 7)
    })

    it('存在しない範囲形状キーを指定したとき、例外を発生する', function() {
      assert.throws(() => {
        findBattleFieldElementsByRange(matrix, {y: 0, x: 0}, 'doesNotExist', 0, 0)
      }, /rangeKey/)
    })

    describe('指定したリーチの幅が範囲形状の複数の断片を含むとき', function() {
      it('断片を近い順で結合した結果を返す', function() {
        const elements = findBattleFieldElementsByRange(matrix, {y: 3, x: 3}, 'cross', 1, 2)
        assert.deepStrictEqual(
          elements,
          [
            matrix[4][3],
            matrix[3][4],
            matrix[2][3],
            matrix[3][2],
            matrix[5][3],
            matrix[3][5],
            matrix[1][3],
            matrix[3][1],
          ]
        )
      })
    })

    describe('指定したリーチの幅が範囲形状の最小リーチ未満であるとき', function() {
      it('空の結果を返す', function() {
        const rangeShapes = {
          foo: [
            {
              reach: 1,
              positionDeltas: [{y: 0, x: 0}],
            },
          ],
        }
        const elements = findBattleFieldElementsByRange(matrix, {y: 0, x: 0}, 'foo', 0, 0, rangeShapes)
        assert.deepStrictEqual(elements, [])
      })
    })

    describe('指定したリーチの幅が範囲形状の最大リーチ超であるとき', function() {
      it('空の結果を返す', function() {
        const rangeShapes = {
          foo: [
            {
              reach: 1,
              positionDeltas: [{y: 0, x: 0}],
            },
          ],
        }
        const elements = findBattleFieldElementsByRange(matrix, {y: 0, x: 0}, 'foo', 2, 2, rangeShapes)
        assert.deepStrictEqual(elements, [])
      })
    })

    describe('指定した範囲に盤の広さを超える位置を含むとき', function() {
      it('盤をはみ出す位置は無視され、盤に存在するマスのみを返す', function() {
        const elements = findBattleFieldElementsByRange(matrix, {y: 3, x: 3}, 'circle', 0, 12)
        assert.strictEqual(elements.length, 49)
        for (const element of elements) {
          assert.strictEqual(element.position.y >= 0, true)
          assert.strictEqual(element.position.y <= 7, true)
          assert.strictEqual(element.position.x >= 0, true)
          assert.strictEqual(element.position.x <= 7, true)
        }
      })
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

  describe('creatureUtils', function() {
    let constants: Game['constants']
    let creature: Creature

    beforeEach(function() {
      constants = createConstants()
      creature = createCreature()
    })

    describe('getAttackPower', function() {
      it('_attackPowerForTest が存在しているときはその値を優先して返す', function() {
        constants.jobs[0].attackPower = 2
        creature._attackPowerForTest = 99
        assert.strictEqual(creatureUtils.getAttackPower(creature, constants), 99)
      })
    })

    describe('getAutoAttackRange', function() {
      it('_autoAttackRangeForTest が存在しているときはその値を優先して返す', function() {
        constants.jobs[0].autoAttackRange = {
          rangeShapeKey: 'circle',
          minReach: 0,
          maxReach: 1,
        }
        creature._autoAttackRangeForTest = {
          rangeShapeKey: 'cross',
          minReach: 2,
          maxReach: 3,
        }
        assert.deepStrictEqual(
          creatureUtils.getAutoAttackRange(creature, constants),
          {
            rangeShapeKey: 'cross',
            minReach: 2,
            maxReach: 3,
          }
        )
      })
    })

    describe('getAutoAttackTargets', function() {
      it('_autoAttackTargetsForTest が存在しているときはその値を優先して返す', function() {
        constants.jobs[0].autoAttackTargets = 1
        creature._autoAttackTargetsForTest = 2
        assert.strictEqual(creatureUtils.getAutoAttackTargets(creature, constants), 2)
      })
    })

    describe('getMaxLifePoints', function() {
      it('_maxLifePointsForTest が存在しているときはその値を優先して返す', function() {
        constants.jobs[0].maxLifePoints = 2
        creature._maxLifePointsForTest = 99
        assert.strictEqual(creatureUtils.getMaxLifePoints(creature, constants), 99)
      })
    })

    describe('getRaidInterval', function() {
      it('_raidIntervalForTest が存在しているときはその値を優先して返す', function() {
        constants.jobs[0].raidInterval = 2
        creature._raidIntervalForTest = 99
        assert.strictEqual(creatureUtils.getRaidInterval(creature, constants), 99)
      })
    })

    describe('getRaidPower', function() {
      beforeEach(function() {
        constants.jobs[0].raidPower = 2
      })

      it('_raidPowerForTest が存在しているときはその値を優先して返す', function() {
        creature._raidPowerForTest = 99
        assert.strictEqual(creatureUtils.getRaidPower(creature, constants), 99)
      })
    })

    describe('getTurnsUntilRaid', function() {
      it('works', function() {
        constants.jobs[0].raidInterval = 5
        creature.raidCharge = 2
        assert.strictEqual(creatureUtils.getTurnsUntilRaid(creature, constants), 3)
      })
    })

    describe('alterLifePoints', function() {
      beforeEach(function() {
        constants.jobs[0].maxLifePoints = 2
        creature.lifePoints = 2
      })

      it('lifePoints は 0 未満にならない', function() {
        assert.strictEqual(creatureUtils.alterLifePoints(creature, constants, -3).lifePoints, 0)
      })

      it('lifePoints は maxLifePoints を超えない', function() {
        assert.strictEqual(creatureUtils.alterLifePoints(creature, constants, 1).lifePoints, 2)
      })
    })

    describe('alterRaidCharge', function() {
      beforeEach(function() {
        constants.jobs[0].raidInterval = 2
        creature.raidCharge = 0
      })

      it('raidCharge は 0 未満にならない', function() {
        assert.strictEqual(creatureUtils.alterRaidCharge(creature, constants, -1).raidCharge, 0)
      })

      it('raidCharge は raidInterval を超えない', function() {
        assert.strictEqual(creatureUtils.alterRaidCharge(creature, constants, 3).raidCharge, 2)
      })
    })

    describe('isRaidChageFull', function() {
      it('raidCharge が raidInterval と等しいときは true を返す', function() {
        constants.jobs[0].raidInterval = 3
        creature.raidCharge = 3
        assert.strictEqual(creatureUtils.isRaidChageFull(creature, constants), true)
      })

      it('raidCharge が raidInterval より小さいときは false を返す', function() {
        constants.jobs[0].raidInterval = 3
        creature.raidCharge = 2
        assert.strictEqual(creatureUtils.isRaidChageFull(creature, constants), false)
      })
    })

    describe('updateRaidChargeWithTurnProgress', function() {
      beforeEach(function() {
        constants.jobs[0].raidInterval = 3
      })

      it('raidCharge が raidInterval と等しいときは 0 へ更新する', function() {
        creature.raidCharge = 3
        assert.strictEqual(creatureUtils.updateRaidChargeWithTurnProgress(creature, constants).raidCharge, 0)
      })

      it('raidCharge が raidInterval より小さいときは 1 を加算する', function() {
        creature.raidCharge = 2
        assert.strictEqual(creatureUtils.updateRaidChargeWithTurnProgress(creature, constants).raidCharge, 3)
      })
    })
  })

  describe('gameParameterUtils', function() {
    let game: Game

    beforeEach(function() {
      game = ensureBattlePage(createStateDisplayBattlePageAtStartOfGame()).game
    })

    describe('alterActionPoints', function() {
      it('actionPoints は 0 未満にならない', function() {
        game.actionPoints = 1
        game = gameParameterUtils.alterActionPoints(game, -2)
        assert.strictEqual(game.actionPoints, 0)
      })

      it('actionPoints は 99 を超えない', function() {
        game.actionPoints = 98
        game = gameParameterUtils.alterActionPoints(game, 2)
        assert.strictEqual(game.actionPoints, 99)
      })
    })
  })
})
