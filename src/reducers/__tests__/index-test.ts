import * as assert from 'assert'
import {describe, it, beforeEach} from 'mocha'

import {
  ApplicationState,
  BattlePage,
  Creature,
  Party,
  createBattleFieldMatrix,
  ensureBattlePage,
  findCreatureById,
} from '../../utils'
import {
  createStateDisplayBattlePageAtStartOfGame,
  findFirstAlly,
} from '../../test-utils'
import {
  runNormalAttackPhase,
  selectBattleFieldElement,
} from '../index'
import {
  placePlayerFactionCreature,
} from '../utils'

describe('reducers/index', function() {
  describe('selectBattleFieldElement', function() {
    describe('In the case that select a card then select an empty element of the battle field', function() {
      let state: ApplicationState, newState: ApplicationState
      let battlePage: BattlePage, newBattlePage: BattlePage
      let allyCreatureId: Creature['id']

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        allyCreatureId = battlePage.game.cardsOnPlayersHand[0].creatureId
        battlePage.game.cursor = {
          globalPosition: {
            globalPlacementId: 'cardsOnPlayersHand',
            creatureId: allyCreatureId,
          },
        }
        newState = selectBattleFieldElement(state, 0, 0)
        newBattlePage = ensureBattlePage(newState)
      })

      it('should place an ally', function() {
        assert.strictEqual(newBattlePage.game.battleFieldMatrix[0][0].creatureId, allyCreatureId)
      })

      it('should reduce cards on player\'s hand', function() {
        assert.strictEqual(
          battlePage.game.cardsOnPlayersHand.length > newBattlePage.game.cardsOnPlayersHand.length,
          true
        )
      })

      it('should remove the cursor from the selcted card', function() {
        assert.strictEqual(newBattlePage.game.cursor, undefined)
      })
    })

    describe('In the case that select a card then select an enemy on the battle field', function() {
      let state: ApplicationState, newState: ApplicationState
      let battlePage: BattlePage, newBattlePage: BattlePage
      let allyCreatureId: Creature['id']

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        allyCreatureId = battlePage.game.cardsOnPlayersHand[0].creatureId
        battlePage.game.cursor = {
          globalPosition: {
            globalPlacementId: 'cardsOnPlayersHand',
            creatureId: allyCreatureId,
          },
        }
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        battlePage.game.battleFieldMatrix[0][0].creatureId = enemy.id
        newState = selectBattleFieldElement(state, 0, 0)
        newBattlePage = ensureBattlePage(newState)
      })

      it('should not reduce cards on player\'s hand', function() {
        assert.strictEqual(battlePage.game.cardsOnPlayersHand.length, newBattlePage.game.cardsOnPlayersHand.length)
      })
    })
  })

  describe('runNormalAttackPhase', function() {
    describe('敵対関係であるクリーチャーが隣接しているとき', function() {
      let state: ApplicationState
      let battlePage: BattlePage
      let a: Creature
      let b: Creature

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        a = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            a.id,
            {y: 0, x: 0}
          )
        }
        battlePage.game.battleFieldMatrix[0][1].creatureId = b.id
      })

      it('互いに攻撃した結果を返す', function() {
        a.lifePoints = 2
        a._attackPowerForTesting = 1
        b.lifePoints = 2
        b._attackPowerForTesting = 1
        const newState = runNormalAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newA = findCreatureById(newBattlePage.game.creatures, a.id)
        const newB = findCreatureById(newBattlePage.game.creatures, b.id)
        assert.notStrictEqual(a.lifePoints, newA.lifePoints)
        assert.strictEqual(a.lifePoints > newA.lifePoints, true)
        assert.notStrictEqual(b.lifePoints, newB.lifePoints)
        assert.strictEqual(b.lifePoints > newB.lifePoints, true)
      })

      describe('a クリーチャーの攻撃で b クリーチャーが死亡するとき', function() {
        beforeEach(function() {
          a.lifePoints = 10
          a._attackPowerForTesting = 1
          b.lifePoints = 1
          b._attackPowerForTesting = 1
        })

        it('b が盤上に存在しない結果を返す', function() {
          const newState = runNormalAttackPhase(state)
          const newBattlePage = ensureBattlePage(newState)
          assert.strictEqual(newBattlePage.game.battleFieldMatrix[0][1].creatureId, undefined)
        })
      })
    })

    describe('味方関係であるクリーチャーが隣接しているとき', function() {
      it('互いに攻撃しなかった結果を返す', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const a = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        const b = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[1].creatureId)
        a.lifePoints = 2
        a._attackPowerForTesting = 1
        b.lifePoints = 2
        b._attackPowerForTesting = 1
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            a.id,
            {y: 0, x: 0}
          )
        }
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            b.id,
            {y: 0, x: 1}
          )
        }
        const newState = runNormalAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newA = findCreatureById(newBattlePage.game.creatures, a.id)
        const newB = findCreatureById(newBattlePage.game.creatures, b.id)
        assert.strictEqual(a.lifePoints, newA.lifePoints)
        assert.strictEqual(b.lifePoints, newB.lifePoints)
      })
    })

    describe('computer 側の攻撃で死亡する player 側のクリーチャーが存在するとき', function() {
      it('死亡した player 側のクリーチャーが山札の末尾へ戻る結果を返す', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const a = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        const b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        a.lifePoints = 1
        a._attackPowerForTesting = 1
        b.lifePoints = 10
        b._attackPowerForTesting = 1
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            a.id,
            {y: 0, x: 0}
          )
        }
        battlePage.game.battleFieldMatrix[0][1].creatureId = b.id
        const cardsInDeck = battlePage.game.cardsInDeck
        const newState = runNormalAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newCardsInDeck = newBattlePage.game.cardsInDeck
        assert.strictEqual(newCardsInDeck.length > cardsInDeck.length, true)
        assert.strictEqual(newCardsInDeck[newCardsInDeck.length - 1].creatureId, a.id)
      })
    })
  })
})
