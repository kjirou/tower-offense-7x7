import * as assert from 'assert'
import {describe, it} from 'mocha'

import {
  ApplicationState,
  BattlePage,
  createBattleFieldMatrix,
} from '../../utils'
import {
  proceedTurn,
} from '../index'

describe('reducers/index', function() {
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
                squareCursor: undefined,
                cards: [],
                cardCreatureIdsOnYourHand: [],
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
                squareCursor: undefined,
                cards: [],
                cardCreatureIdsOnYourHand: [],
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
