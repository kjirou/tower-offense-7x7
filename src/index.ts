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
  Party,
  SkillCategoryId,
  createBattleFieldMatrix,
} from './utils'

const dummyAllCreatures: Creature[] = [
  {
    id: 'ally-1',
    jobId: 'fighter',
    lifePoint: 12,
    attackPoint: 4,
    skillIds: [],
  },
  {
    id: 'ally-2',
    jobId: 'knight',
    lifePoint: 18,
    attackPoint: 2,
    skillIds: [],
  },
  {
    id: 'ally-3',
    jobId: 'archer',
    lifePoint: 6,
    attackPoint: 3,
    skillIds: [],
  },
  {
    id: 'ally-4',
    jobId: 'mage',
    lifePoint: 3,
    attackPoint: 3,
    skillIds: [],
  },
  {
    id: 'ally-5',
    jobId: 'fighter',
    lifePoint: 12,
    attackPoint: 4,
    skillIds: [],
  },
  {
    id: 'ally-6',
    jobId: 'mage',
    lifePoint: 3,
    attackPoint: 3,
    skillIds: [],
  },
  {
    id: 'ally-7',
    jobId: 'archer',
    lifePoint: 6,
    attackPoint: 3,
    skillIds: [],
  },
  {
    id: 'enemy-1',
    jobId: 'goblin',
    lifePoint: 4,
    attackPoint: 1,
    skillIds: [],
  },
  {
    id: 'enemy-2',
    jobId: 'goblin',
    lifePoint: 4,
    attackPoint: 1,
    skillIds: [],
  },
  {
    id: 'enemy-3',
    jobId: 'orc',
    lifePoint: 8,
    attackPoint: 3,
    skillIds: [],
  },
]
const dummyAllCards: Card[] = dummyAllCreatures
  .filter(e => /^ally-/.test(e.id))
  .map((creature, index) => {
    const skillCategoryId = ['attack', 'defense', 'support'][index % 3] as SkillCategoryId
    return {
      skillCategoryId,
      creatureId: creature.id,
    }
  })

function createInitialGame(): Game {
  const battleFieldMatrix = createBattleFieldMatrix(7, 7)

  // "ally-1"
  battleFieldMatrix[3][2].creatureId = dummyAllCreatures[0].id
  // "ally-4"
  battleFieldMatrix[2][1].creatureId = dummyAllCreatures[3].id
  battleFieldMatrix[3][3].creatureId = dummyAllCreatures[7].id
  battleFieldMatrix[4][3].creatureId = dummyAllCreatures[9].id

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
    cards: dummyAllCards,
    cardsOnYourHand: [
      {creatureId: 'ally-2'},
      {creatureId: 'ally-3'},
      {creatureId: 'ally-5'},
      {creatureId: 'ally-6'},
      {creatureId: 'ally-7'},
    ],
    cursor: undefined,
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
