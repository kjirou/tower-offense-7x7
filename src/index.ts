import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {
  App,
} from './App'
import {
  ApplicationState,
  Card,
  Creature,
  Game,
  MAX_NUMBER_OF_PLAYERS_HAND,
  Party,
  SkillCategoryId,
  createBattleFieldMatrix,
} from './utils'

const dummyAllies: Creature[] = Array.from({length: 20}).map((unused, index) => {
  const id = `ally-${index + 1}`
  switch (index % 5) {
    case 0:
      return {
        id,
        jobId: 'fighter',
        lifePoint: 12,
        attackPoint: 4,
        skillIds: [],
      }
    case 1:
      return {
        id,
        jobId: 'knight',
        lifePoint: 18,
        attackPoint: 2,
        skillIds: [],
      }
    case 2:
      return {
        id,
        jobId: 'archer',
        lifePoint: 6,
        attackPoint: 3,
        skillIds: [],
      }
    case 3:
      return {
        id,
        jobId: 'mage',
        lifePoint: 3,
        attackPoint: 3,
        skillIds: [],
      }
    case 4:
      return {
        id,
        jobId: 'priest',
        lifePoint: 5,
        attackPoint: 1,
        skillIds: [],
      }
    default:
      throw new Error('')
  }
})
const dummyEnemies: Creature[] = Array.from({length: 20}).map((unused, index) => {
  const id = `enemy-${index + 1}`
  switch (index % 2) {
    case 0:
      return {
        id,
        jobId: 'goblin',
        lifePoint: 4,
        attackPoint: 1,
        skillIds: [],
      }
    case 1:
      return {
        id,
        jobId: 'orc',
        lifePoint: 8,
        attackPoint: 3,
        skillIds: [],
      }
    default:
      throw new Error('')
  }
})
const dummyAllCards: Card[] = dummyAllies
  .map((creature, index) => {
    const skillCategoryId = ['attack', 'defense', 'support'][index % 3] as SkillCategoryId
    return {
      skillCategoryId,
      creatureId: creature.id,
    }
  })

function createInitialGame(): Game {
  const battleFieldMatrix = createBattleFieldMatrix(7, 7)

  battleFieldMatrix[3][3].creatureId = dummyEnemies[0].id
  battleFieldMatrix[4][3].creatureId = dummyEnemies[1].id

  return {
    creatures: dummyAllies.concat(dummyEnemies),
    parties: [
      {
        factionId: 'player',
        creatureIds: dummyAllies.map(e => e.id),
      },
      {
        factionId: 'computer',
        creatureIds: dummyEnemies.map(e => e.id),
      },
    ],
    battleFieldMatrix,
    cards: dummyAllCards,
    cardsOnPlayersHand: dummyAllCards
      .slice(0, MAX_NUMBER_OF_PLAYERS_HAND)
      .map((card) => {
        return {
          creatureId: card.creatureId,
        }
      }),
    cardsInDeck: dummyAllCards
      .slice(MAX_NUMBER_OF_PLAYERS_HAND, dummyAllCards.length)
      .map((card) => {
        return {
          creatureId: card.creatureId,
        }
      }),
    cursor: undefined,
    completedNormalAttackPhase: false,
    turnNumber: 1,
  }
}

function createInitialApplicationState(): ApplicationState {
  return {
    pages: {
      battle: {
        game: createInitialGame(),
      },
    },
  }
}

window.addEventListener('DOMContentLoaded', function() {
  const appDestination = document.querySelector('.js-app')

  if (appDestination) {
    const applicationState = createInitialApplicationState()

    ReactDOM.render(
      React.createElement(App, {initialState: applicationState}),
      appDestination
    )
  }
})
