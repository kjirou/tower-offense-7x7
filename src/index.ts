import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {
  App,
} from './App'
import {
  ApplicationState,
  Creature,
  GameState,
  Party,
  createBattleFieldMatrix,
} from './utils'

const dummyAllCreatures: Creature[] = [
  {
    id: 'ally-1',
    jobId: 'fighter',
    lifePoint: 12,
    attackPoint: 4,
  },
  {
    id: 'ally-2',
    jobId: 'knight',
    lifePoint: 18,
    attackPoint: 2,
  },
  {
    id: 'ally-3',
    jobId: 'archer',
    lifePoint: 6,
    attackPoint: 3,
  },
  {
    id: 'ally-4',
    jobId: 'mage',
    lifePoint: 3,
    attackPoint: 3,
  },
  {
    id: 'ally-5',
    jobId: 'fighter',
    lifePoint: 12,
    attackPoint: 4,
  },
  {
    id: 'ally-6',
    jobId: 'mage',
    lifePoint: 3,
    attackPoint: 3,
  },
  {
    id: 'enemy-1',
    jobId: 'goblin',
    lifePoint: 4,
    attackPoint: 1,
  },
  {
    id: 'enemy-2',
    jobId: 'goblin',
    lifePoint: 4,
    attackPoint: 1,
  },
  {
    id: 'enemy-3',
    jobId: 'orc',
    lifePoint: 8,
    attackPoint: 3,
  },
]

function createInitialGameState(): GameState {
  const battleFieldMatrix = createBattleFieldMatrix(7, 7)

  battleFieldMatrix[2][1].creatureId = dummyAllCreatures[5].id
  battleFieldMatrix[3][2].creatureId = dummyAllCreatures[4].id
  battleFieldMatrix[3][3].creatureId = dummyAllCreatures[6].id
  battleFieldMatrix[4][3].creatureId = dummyAllCreatures[8].id

  const cardsOnYourHand: GameState['cardsOnYourHand'] = {
    cards: [
      {
        uid: 'card-1',
        skillId: 'attack',
      },
      {
        uid: 'card-2',
        skillId: 'healing',
      },
      {
        uid: 'card-3',
        skillId: 'attack',
      },
      {
        uid: 'card-4',
        skillId: 'attack',
      },
      {
        uid: 'card-5',
        skillId: 'support',
      },
    ],
  }

  return {
    creatures: dummyAllCreatures,
    parties: [
      {
        factionId: 'player',
        creatureIds: dummyAllCreatures
          .filter(e => /^ally-/.test(e.id))
          .map(e => e.id),
      },
      {
        factionId: 'computer',
        creatureIds: dummyAllCreatures
          .filter(e => /^enemy-/.test(e.id))
          .map(e => e.id),
      },
    ],
    battleFieldMatrix,
    cardsOnYourHand,
    squareCursor: undefined,
  }
}

function createInitialApplicationState(): ApplicationState {
  return {
    pages: {
      battle: {
        game: createInitialGameState(),
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
