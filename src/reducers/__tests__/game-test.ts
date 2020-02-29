import * as assert from 'assert'
import {
  describe,
  it,
} from 'mocha'

import {
  BattleFieldMatrix,
  Creature,
  CreatureAppearance,
  NormalAttackProcessContext,
  Party,
  SkillProcessContext,
  createBattleFieldMatrix,
  ensureBattlePage,
  findCreatureById,
} from '../../utils'
import {
  createCreature,
  createStateDisplayBattlePageAtStartOfGame,
  findFirstAlly,
} from '../../test-utils'
import {
  doesPlayerHaveDefeat,
  doesPlayerHaveVictory,
  invokeNormalAttack,
  invokeSkill,
  placePlayerFactionCreature,
  refillCardsOnPlayersHand,
  removeDeadCreatures,
  reserveCreatures,
} from '../game'

describe('reducers/game', function() {
  describe('doesPlayerHaveVictory', function() {
    const parties: Party[] = [
      {factionId: 'player', creatureIds: ['x']},
      {factionId: 'computer', creatureIds: ['a', 'b']},
    ]
    const creatureAppearances: CreatureAppearance[] = [
      {turnNumber: 1, creatureIds: ['a']},
      {turnNumber: 2, creatureIds: ['b']},
    ]

    describe('ターン数が、computer 側クリーチャーの出現する最後のターンのとき', function() {
      const currentTurnNumber = 2

      it('予約の computer 側クリーチャーが盤上に存在するとき、勝利ではない', function() {
        const battleFieldMatrix = createBattleFieldMatrix(1, 1)
        battleFieldMatrix[0][0].reservedCreatureId = 'a'
        assert.strictEqual(
          doesPlayerHaveVictory(parties, battleFieldMatrix, creatureAppearances, currentTurnNumber),
          false
        )
      })

      it('computer 側クリーチャーが盤上に存在するとき、勝利ではない', function() {
        const battleFieldMatrix = createBattleFieldMatrix(1, 1)
        battleFieldMatrix[0][0].creatureId = 'a'
        assert.strictEqual(
          doesPlayerHaveVictory(parties, battleFieldMatrix, creatureAppearances, currentTurnNumber),
          false
        )
      })

      describe('予約を含む computer 側クリーチャーが盤上に存在しないとき', function() {
        it('player 側クリーチャーが盤上に存在するときでも、勝利である', function() {
          const battleFieldMatrix = createBattleFieldMatrix(1, 1)
          battleFieldMatrix[0][0].creatureId = 'x'
          assert.strictEqual(
            doesPlayerHaveVictory(parties, battleFieldMatrix, creatureAppearances, currentTurnNumber),
            true
          )
        })
      })
    })

    describe('ターン数が、computer 側クリーチャーの出現する最後のターン未満のとき', function() {
      const currentTurnNumber = 1

      it('予約を含む computer 側クリーチャーが盤上に存在しないときでも、勝利ではない', function() {
        const battleFieldMatrix = createBattleFieldMatrix(1, 1)
        assert.strictEqual(
          doesPlayerHaveVictory(parties, battleFieldMatrix, creatureAppearances, currentTurnNumber),
          false
        )
      })
    })
  })

  describe('doesPlayerHaveDefeat', function() {
    it('works', function() {
      assert.strictEqual(doesPlayerHaveDefeat(0), true)
      assert.strictEqual(doesPlayerHaveDefeat(1), false)
    })
  })

  describe('removeDeadCreatures', function() {
    let creatures: Creature[]
    let battleFieldMatrix: BattleFieldMatrix

    beforeEach(function() {
      creatures = [createCreature()]
      battleFieldMatrix = createBattleFieldMatrix(1, 1)
    })

    describe('死亡しているクリーチャーがいるとき', function() {
      describe('死亡しているクリーチャーが player へ所属するとき', function() {
        let parties: Party[]

        beforeEach(function() {
          creatures[0].lifePoint = 0
          battleFieldMatrix[0][0].creatureId = creatures[0].id
          parties = [{
            factionId: 'player',
            creatureIds: creatures.map(e => e.id),
          }]
        })

        it('盤上から削除する', function() {
          const result = removeDeadCreatures(creatures, parties, battleFieldMatrix, [])
          assert.strictEqual(result.battleFieldMatrix[0][0].creatureId, undefined)
        })

        it('山札の末尾へ戻る', function() {
          const result = removeDeadCreatures(creatures, parties, battleFieldMatrix, [])
          assert.strictEqual(result.cardsInDeck.length, 1)
          assert.strictEqual(result.cardsInDeck[0].creatureId, creatures[0].id)
        })
      })

      describe('死亡しているクリーチャーが computer へ所属するとき', function() {
        let parties: Party[]

        beforeEach(function() {
          creatures[0].lifePoint = 0
          battleFieldMatrix[0][0].creatureId = creatures[0].id
          parties = [{
            factionId: 'computer',
            creatureIds: creatures.map(e => e.id),
          }]
        })

        it('盤上から削除する', function() {
          const result = removeDeadCreatures(creatures, parties, battleFieldMatrix, [])
          assert.strictEqual(result.battleFieldMatrix[0][0].creatureId, undefined)
        })

        it('山札は変わらない', function() {
          const result = removeDeadCreatures(creatures, parties, battleFieldMatrix, [])
          assert.strictEqual(result.cardsInDeck.length, 0)
        })
      })
    })

    describe('死亡していないクリーチャーがいるとき', function() {
      let parties: Party[]

      beforeEach(function() {
        creatures[0].lifePoint = 1
        battleFieldMatrix[0][0].creatureId = creatures[0].id
        parties = [{
          factionId: 'player',
          creatureIds: creatures.map(e => e.id),
        }]
      })

      it('盤上から削除しない', function() {
        const result = removeDeadCreatures(creatures, parties, battleFieldMatrix, [])
        assert.strictEqual(result.battleFieldMatrix[0][0].creatureId, creatures[0].id)
      })
    })
  })

  describe('invokeNormalAttack', function() {
    describe('When an attacker is adjacent to an enemy', function() {
      it('can attack the enemy', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const attacker = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        attacker.attackPoint = 1
        enemy.lifePoint = 2
        battlePage.game.battleFieldMatrix[0][0].creatureId = attacker.id
        battlePage.game.battleFieldMatrix[0][1].creatureId = enemy.id
        const context: NormalAttackProcessContext = {
          creatures: battlePage.game.creatures,
          parties: battlePage.game.parties,
          battleFieldMatrix: battlePage.game.battleFieldMatrix,
          attackerCreatureId: attacker.id,
        }
        const newContext = invokeNormalAttack(context)
        const newEnemy = findCreatureById(newContext.creatures, enemy.id)
        assert.strictEqual(newEnemy.lifePoint < enemy.lifePoint, true)
      })
    })

    describe('When an attacker and its enemy are two distances apart', function() {
      it('can not attack the enemy', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const attacker = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        attacker.attackPoint = 1
        enemy.lifePoint = 2
        battlePage.game.battleFieldMatrix[0][0].creatureId = attacker.id
        battlePage.game.battleFieldMatrix[0][2].creatureId = enemy.id
        const context: NormalAttackProcessContext = {
          creatures: battlePage.game.creatures,
          parties: battlePage.game.parties,
          battleFieldMatrix: battlePage.game.battleFieldMatrix,
          attackerCreatureId: attacker.id,
        }
        const newContext = invokeNormalAttack(context)
        const newEnemy = findCreatureById(newContext.creatures, enemy.id)
        assert.strictEqual(newEnemy.lifePoint, enemy.lifePoint)
      })
    })
  })

  describe('invokeSkill', function() {
    describe('Attack skill', function() {
      describe('When an invoker is adjacent to an enemy', function() {
        it('can attack the enemy', function() {
          const state = createStateDisplayBattlePageAtStartOfGame()
          const battlePage = ensureBattlePage(state)
          const invoker = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
          const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
          battlePage.game.battleFieldMatrix[0][0].creatureId = invoker.id
          battlePage.game.battleFieldMatrix[0][1].creatureId = enemy.id
          const context: SkillProcessContext = {
            skill: {
              id: '',
              skillCategoryId: 'attack',
            },
            creatures: battlePage.game.creatures,
            parties: battlePage.game.parties,
            battleFieldMatrix: battlePage.game.battleFieldMatrix,
            invokerCreatureId: invoker.id,
          }
          const newContext = invokeSkill(context)
          const newEnemy = findCreatureById(newContext.creatures, enemy.id)
          assert.strictEqual(newEnemy.lifePoint < enemy.lifePoint, true)
        })
      })
    })
  })

  describe('placePlayerFactionCreature', function() {
    it('指定したマスにクリーチャーが存在するとき、例外を発生する', function() {
      const matrix = createBattleFieldMatrix(1, 1)
      matrix[0][0].creatureId = 'a'
      assert.throws(() => {
        placePlayerFactionCreature(matrix, [], 'b', {y: 0, x: 0})
      }, /creature exist/)
    })

    it('指定したクリーチャーが手札にないとき、例外を発生する', function() {
      const matrix = createBattleFieldMatrix(1, 1)
      assert.throws(() => {
        placePlayerFactionCreature(matrix, [], 'a', {y: 0, x: 0})
      }, /does not exist/)
    })

    it('盤上へクリーチャーが配置される', function() {
      const matrix = createBattleFieldMatrix(1, 1)
      const result = placePlayerFactionCreature(matrix, [{creatureId: 'a'}], 'a', {y: 0, x: 0})
      assert.strictEqual(result.battleFieldMatrix[0][0].creatureId, 'a')
    })

    it('指定したクリーチャーのカードが手札から削除される', function() {
      const matrix = createBattleFieldMatrix(1, 1)
      const result = placePlayerFactionCreature(matrix, [{creatureId: 'a'}, {creatureId: 'b'}], 'a', {y: 0, x: 0})
      assert.deepStrictEqual(result.cardsOnPlayersHand, [{creatureId: 'b'}])
    })
  })

  describe('refillCardsOnPlayersHand', function() {
    it('works', function() {
      const result = refillCardsOnPlayersHand(
        [
          {creatureId: 'a'},
          {creatureId: 'b'},
          {creatureId: 'c'},
          {creatureId: 'd'},
          {creatureId: 'e'},
        ],
        [
          {creatureId: 'x'},
          {creatureId: 'y'},
        ]
      )
      assert.deepStrictEqual(result.cardsInDeck, [
        {creatureId: 'd'},
        {creatureId: 'e'},
      ])
      assert.deepStrictEqual(result.cardsOnPlayersHand, [
        {creatureId: 'x'},
        {creatureId: 'y'},
        {creatureId: 'a'},
        {creatureId: 'b'},
        {creatureId: 'c'},
      ])
    })
  })

  describe('reserveCreatures', function() {
    it('works', function() {
      const matrix = createBattleFieldMatrix(3, 3)
      const creatureAppearances = [
        {
          turnNumber: 2,
          creatureIds: ['a', 'b'],
        }
      ]
      const result = reserveCreatures(
        matrix, creatureAppearances, 2, (elements, num) => elements.slice(0, num))
      assert.strictEqual(result.battleFieldMatrix[0][0].reservedCreatureId, 'a')
      assert.strictEqual(result.battleFieldMatrix[0][1].reservedCreatureId, 'b')
    })
  })
})
