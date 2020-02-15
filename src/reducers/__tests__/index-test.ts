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
  findFirstEnemy,
} from '../../test-fixtures'
import {
  proceedTurn,
  selectBattleFieldElement,
} from '../index'

describe('reducers/index', function() {
  describe('selectBattleFieldElement', function() {
    describe('Select a card then place an ally to an empty element of the battle field', function() {
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
        const enemy = findFirstEnemy(battlePage.game.creatures, battlePage.game.parties, 'player')
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
      const createApplicationState = (): ApplicationState => {
        const a = {
          id: 'a',
          jobId: '',
          attackPoint: 1,
          lifePoint: 2,
        }
        const b = {
          id: 'b',
          jobId: '',
          attackPoint: 1,
          lifePoint: 3,
        }
        const battleFieldMatrix = createBattleFieldMatrix(1, 2)
        battleFieldMatrix[0][0].creatureId = a.id
        battleFieldMatrix[0][1].creatureId = b.id

        return {
          pages: {
            battle: {
              game: {
                creatures: [a, b],
                parties: [
                  {
                    factionId: 'player',
                    creatureIds: [a.id],
                  },
                  {
                    factionId: 'computer',
                    creatureIds: [b.id],
                  },
                ],
                battleFieldMatrix,
                cards: [],
                cardsOnYourHand: [],
                cursor: undefined,
              },
            },
          },
        }
      }

      it('can update the result that creatures attack to each other', function() {
        const state = createApplicationState()
        const battlePage = state.pages.battle as BattlePage
        const newState = proceedTurn(state)
        const newBattlePage = newState.pages.battle as BattlePage
        assert.notStrictEqual(battlePage.game.creatures[0].lifePoint, newBattlePage.game.creatures[0].lifePoint)
        assert.strictEqual(
          battlePage.game.creatures[0].lifePoint > newBattlePage.game.creatures[0].lifePoint,
          true
        )
        assert.notStrictEqual(battlePage.game.creatures[1].lifePoint, newBattlePage.game.creatures[1].lifePoint)
        assert.strictEqual(
          battlePage.game.creatures[1].lifePoint > newBattlePage.game.creatures[1].lifePoint,
          true
        )
      })
    })

    describe('Creatures of the friendly relations are adjacent to each other', function() {
      const createApplicationState = (): ApplicationState => {
        const a = {
          id: 'a',
          jobId: '',
          attackPoint: 1,
          lifePoint: 2,
        }
        const b = {
          id: 'b',
          jobId: '',
          attackPoint: 1,
          lifePoint: 3,
        }
        const battleFieldMatrix = createBattleFieldMatrix(1, 2)
        battleFieldMatrix[0][0].creatureId = a.id
        battleFieldMatrix[0][1].creatureId = b.id

        return {
          pages: {
            battle: {
              game: {
                creatures: [a, b],
                parties: [
                  {
                    factionId: 'player',
                    creatureIds: [a.id],
                  },
                  {
                    factionId: 'player',
                    creatureIds: [b.id],
                  },
                ],
                battleFieldMatrix,
                cards: [],
                cardsOnYourHand: [],
                cursor: undefined,
              },
            },
          },
        }
      }

      it('can update the result that creatures does not attack to each other', function() {
        const state = createApplicationState()
        const battlePage = state.pages.battle as BattlePage
        const newState = proceedTurn(state)
        const newBattlePage = newState.pages.battle as BattlePage
        assert.strictEqual(battlePage.game.creatures[0].lifePoint, newBattlePage.game.creatures[0].lifePoint)
        assert.strictEqual(battlePage.game.creatures[1].lifePoint, newBattlePage.game.creatures[1].lifePoint)
      })
    })
  })
})
