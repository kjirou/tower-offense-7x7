import * as assert from 'assert'
import {describe, it, beforeEach} from 'mocha'

import {
  ApplicationState,
  BattlePage,
  Creature,
  Party,
  createBattleFieldMatrix,
  ensureBattlePage,
} from '../../utils'
import {
  createStateDisplayBattlePageAtStartOfGame,
  findAllies,
  findFirstAlly,
} from '../../test-utils'
import {
  runNormalAttackPhase,
  selectBattleFieldElement,
} from '../index'

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
        a = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        battlePage.game.battleFieldMatrix[0][0].creatureId = a.id
        battlePage.game.battleFieldMatrix[0][1].creatureId = b.id
      })

      it('互いに攻撃した結果を返す', function() {
        a.lifePoint = 2
        a.attackPoint = 1
        b.lifePoint = 2
        b.attackPoint = 1
        const newState = runNormalAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newA = findFirstAlly(newBattlePage.game.creatures, newBattlePage.game.parties, 'player')
        const newB = findFirstAlly(newBattlePage.game.creatures, newBattlePage.game.parties, 'computer')
        assert.notStrictEqual(a.lifePoint, newA.lifePoint)
        assert.strictEqual(a.lifePoint > newA.lifePoint, true)
        assert.notStrictEqual(b.lifePoint, newB.lifePoint)
        assert.strictEqual(b.lifePoint > newB.lifePoint, true)
      })

      describe('a クリーチャーの攻撃で b クリーチャーが死亡するとき', function() {
        beforeEach(function() {
          a.lifePoint = 10
          a.attackPoint = 1
          b.lifePoint = 1
          b.attackPoint = 1
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
        const allies = findAllies(battlePage.game.creatures, battlePage.game.parties, 'player')
        allies[0].lifePoint = 2
        allies[0].attackPoint = 1
        allies[1].lifePoint = 2
        allies[1].attackPoint = 1
        battlePage.game.battleFieldMatrix[0][0].creatureId = allies[0].id
        battlePage.game.battleFieldMatrix[0][1].creatureId = allies[1].id
        const newState = runNormalAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newAllies = findAllies(newBattlePage.game.creatures, newBattlePage.game.parties, 'player')
        assert.strictEqual(allies[0].lifePoint, newAllies[0].lifePoint)
        assert.strictEqual(allies[1].lifePoint, newAllies[1].lifePoint)
      })
    })

    describe('computer 側の攻撃で死亡する player 側のクリーチャーが存在するとき', function() {
      it('死亡した player 側のクリーチャーが山札の末尾へ戻る結果を返す', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const a = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        const b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        a.lifePoint = 1
        a.attackPoint = 1
        b.lifePoint = 10
        b.attackPoint = 1
        battlePage.game.battleFieldMatrix[0][0].creatureId = a.id
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
