import * as assert from 'assert'
import {describe, it} from 'mocha'

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
} from '../../test-fixtures'
import {
  proceedTurn,
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
        allyCreatureId = battlePage.game.cardsOnYourHand[0].creatureId
        battlePage.game.cursor = {
          globalPosition: {
            globalPlacementId: 'cardsOnYourHand',
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
          battlePage.game.cardsOnYourHand.length > newBattlePage.game.cardsOnYourHand.length,
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
        allyCreatureId = battlePage.game.cardsOnYourHand[0].creatureId
        battlePage.game.cursor = {
          globalPosition: {
            globalPlacementId: 'cardsOnYourHand',
            creatureId: allyCreatureId,
          },
        }
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        battlePage.game.battleFieldMatrix[0][0].creatureId = enemy.id
        newState = selectBattleFieldElement(state, 0, 0)
        newBattlePage = ensureBattlePage(newState)
      })

      it('should not reduce cards on player\'s hand', function() {
        assert.strictEqual(battlePage.game.cardsOnYourHand.length, newBattlePage.game.cardsOnYourHand.length)
      })
    })
  })

  describe('proceedTurn', function() {
    describe('Creatures of the hostile relations are adjacent to each other', function() {
      it('can update the result that creatures attack to each other', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const a = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        const b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        a.lifePoint = 2
        a.attackPoint = 1
        b.lifePoint = 2
        b.attackPoint = 1
        battlePage.game.battleFieldMatrix[0][0].creatureId = a.id
        battlePage.game.battleFieldMatrix[0][1].creatureId = b.id
        const newState = proceedTurn(state)
        const newBattlePage = ensureBattlePage(newState)
        const newA = findFirstAlly(newBattlePage.game.creatures, newBattlePage.game.parties, 'player')
        const newB = findFirstAlly(newBattlePage.game.creatures, newBattlePage.game.parties, 'computer')
        assert.notStrictEqual(a.lifePoint, newA.lifePoint)
        assert.strictEqual(a.lifePoint > newA.lifePoint, true)
        assert.notStrictEqual(b.lifePoint, newB.lifePoint)
        assert.strictEqual(b.lifePoint > newB.lifePoint, true)
      })
    })

    describe('Creatures of the friendly relations are adjacent to each other', function() {
      it('can update the result that creatures does not attack to each other', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const allies = findAllies(battlePage.game.creatures, battlePage.game.parties, 'player')
        allies[0].lifePoint = 2
        allies[0].attackPoint = 1
        allies[1].lifePoint = 2
        allies[1].attackPoint = 1
        battlePage.game.battleFieldMatrix[0][0].creatureId = allies[0].id
        battlePage.game.battleFieldMatrix[0][1].creatureId = allies[1].id
        const newState = proceedTurn(state)
        const newBattlePage = ensureBattlePage(newState)
        const newAllies = findAllies(newBattlePage.game.creatures, newBattlePage.game.parties, 'player')
        assert.strictEqual(allies[0].lifePoint, newAllies[0].lifePoint)
        assert.strictEqual(allies[1].lifePoint, newAllies[1].lifePoint)
      })
    })
  })
})
