import * as assert from 'assert'
import {
  describe,
  it,
} from 'mocha'

import {
  NormalAttackProcessContext,
  SkillProcessContext,
  createBattleFieldMatrix,
  ensureBattlePage,
  findCreatureById,
} from '../../utils'
import {
  createStateDisplayBattlePageAtStartOfGame,
  findFirstAlly,
} from '../../test-utils'
import {
  determinePositionsOfCreatureAppearance,
  invokeNormalAttack,
  invokeSkill,
  placePlayerFactionCreature,
  refillCardsOnPlayersHand,
} from '../game'

describe('reducers/game', function() {
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

  describe('determinePositionsOfCreatureAppearance', function() {
    it('works', function() {
      const matrix = createBattleFieldMatrix(3, 3)
      const creatureAppearances = [
        {
          turnNumber: 2,
          creatureIds: ['a', 'b'],
        }
      ]
      const result = determinePositionsOfCreatureAppearance(
        matrix, creatureAppearances, 2, (elements, num) => elements.slice(0, num))
      assert.strictEqual(result.length, 2)
      assert.strictEqual(result[0].creatureId, 'a')
      assert.strictEqual(result[1].creatureId, 'b')
    })
  })
})
