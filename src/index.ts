import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {
  App,
} from './App'
import {
  ApplicationState,
  BattleFieldElement,
  Card,
  Creature,
  Game,
  Job,
  MAX_NUMBER_OF_PLAYERS_HAND,
  Party,
  SkillCategoryId,
  createBattleFieldMatrix,
} from './utils'
// TODO: 直接呼び出さない
import {
  initializeGame,
} from './reducers/utils'

const dummyJobTemplate = {
  id: '',
  maxLifePoints: 1,
  attackPower: 1,
  raidInterval: 0,
  raidPower: 0,
}
const dummyJobs: Job[] = [
  {
    ...dummyJobTemplate,
    id: 'archer',
    maxLifePoints: 6,
    attackPower: 3,
  },
  {
    ...dummyJobTemplate,
    id: 'fighter',
    maxLifePoints: 12,
    attackPower: 4,
  },
  {
    ...dummyJobTemplate,
    id: 'goblin',
    maxLifePoints: 5,
    attackPower: 1,
    raidInterval: 1,
    raidPower: 1,
  },
  {
    ...dummyJobTemplate,
    id: 'knight',
    maxLifePoints: 18,
    attackPower: 2,
  },
  {
    ...dummyJobTemplate,
    id: 'mage',
    maxLifePoints: 3,
    attackPower: 3,
  },
  {
    ...dummyJobTemplate,
    id: 'orc',
    maxLifePoints: 10,
    attackPower: 3,
    raidInterval: 2,
    raidPower: 3,
  },
  {
    ...dummyJobTemplate,
    id: 'priest',
    maxLifePoints: 5,
    attackPower: 1,
  },
]
const dummyAllies: Creature[] = Array.from({length: 20}).map((unused, index) => {
  const dummyAllyTemplate = {
    id: `ally-${index + 1}`,
    jobId: '',
    lifePoints: 0,
    raidCharge: 0,
    skillIds: [],
  }
  switch (index % 5) {
    case 0:
      return {
        ...dummyAllyTemplate,
        jobId: 'fighter',
      }
    case 1:
      return {
        ...dummyAllyTemplate,
        jobId: 'knight',
      }
    case 2:
      return {
        ...dummyAllyTemplate,
        jobId: 'archer',
      }
    case 3:
      return {
        ...dummyAllyTemplate,
        jobId: 'mage',
      }
    case 4:
      return {
        ...dummyAllyTemplate,
        jobId: 'priest',
      }
    default:
      throw new Error('')
  }
})
const dummyEnemies: Creature[] = Array.from({length: 20}).map((unused, index) => {
  const dummyEnemyTemplate = {
    id: `enemy-${index + 1}`,
    jobId: '',
    lifePoints: 0,
    raidCharge: 0,
    skillIds: [],
  }
  switch (index % 2) {
    case 0:
      return {
        ...dummyEnemyTemplate,
        jobId: 'goblin',
      }
    case 1:
      return {
        ...dummyEnemyTemplate,
        jobId: 'orc',
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
const dummyCreatureAppearances = dummyEnemies
  .slice(0, 10)
  .map((creature, index) => {
    return {
      turnNumber: index,
      creatureIds: [creature.id],
    }
  })

function createInitialGame(): Game {
  const battleFieldMatrix = createBattleFieldMatrix(7, 7)

  let game: Game = {
    jobs: dummyJobs,
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
    creatureAppearances: dummyCreatureAppearances,
    cursor: undefined,
    completedNormalAttackPhase: false,
    turnNumber: 1,
    battleResult: {
      victoryOrDefeatId: 'pending',
    },
    headquartersLifePoints: 10,
  }

  return initializeGame(game)
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
