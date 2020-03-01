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
  MAX_NUMBER_OF_PLAYERS_HAND,
  Party,
  SkillCategoryId,
  choiceElementsAtRandom,
  createBattleFieldMatrix,
} from './utils'
// TODO: 直接呼び出さない
import {
  reserveCreatures,
} from './reducers/game'

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
    headquartersLifePoint: 10,
  }

  game = {
    ...game,
    ...reserveCreatures(
      game.battleFieldMatrix,
      game.creatureAppearances,
      0,
      (elements: BattleFieldElement[], numberOfElements: number): BattleFieldElement[] => {
        return choiceElementsAtRandom<BattleFieldElement>(elements, numberOfElements)
      }
    ),
  }

  return game
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
