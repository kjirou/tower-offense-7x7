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

// TODO: 差分だけ更新すればいいようにリファクタリング。
const dummyJobs: Job[] = [
  {
    id: 'archer',
    maxLifePoints: 6,
    attackPower: 3,
    raidInterval: 0,
    raidPower: 0,
  },
  {
    id: 'fighter',
    maxLifePoints: 12,
    attackPower: 4,
    raidInterval: 0,
    raidPower: 0,
  },
  {
    id: 'goblin',
    maxLifePoints: 5,
    attackPower: 1,
    raidInterval: 1,
    raidPower: 1,
  },
  {
    id: 'knight',
    maxLifePoints: 18,
    attackPower: 2,
    raidInterval: 0,
    raidPower: 0,
  },
  {
    id: 'mage',
    maxLifePoints: 3,
    attackPower: 3,
    raidInterval: 0,
    raidPower: 0,
  },
  {
    id: 'orc',
    maxLifePoints: 10,
    attackPower: 3,
    raidInterval: 2,
    raidPower: 3,
  },
  {
    id: 'priest',
    maxLifePoints: 5,
    attackPower: 1,
    raidInterval: 0,
    raidPower: 0,
  },
]
const dummyAllies: Creature[] = Array.from({length: 20}).map((unused, index) => {
  const id = `ally-${index + 1}`
  // TODO: 差分だけ更新すればいいようにリファクタリング。
  switch (index % 5) {
    case 0:
      return {
        id,
        jobId: 'fighter',
        lifePoints: 0,
        raidCharge: 0,
        skillIds: [],
      }
    case 1:
      return {
        id,
        jobId: 'knight',
        lifePoints: 0,
        raidCharge: 0,
        skillIds: [],
      }
    case 2:
      return {
        id,
        jobId: 'archer',
        lifePoints: 0,
        raidCharge: 0,
        skillIds: [],
      }
    case 3:
      return {
        id,
        jobId: 'mage',
        lifePoints: 0,
        raidCharge: 0,
        skillIds: [],
      }
    case 4:
      return {
        id,
        jobId: 'priest',
        lifePoints: 0,
        raidCharge: 0,
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
        lifePoints: 0,
        raidCharge: 0,
        skillIds: [],
      }
    case 1:
      return {
        id,
        jobId: 'orc',
        lifePoints: 0,
        raidCharge: 0,
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
