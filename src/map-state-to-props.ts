import produce, {Draft} from 'immer'
import * as React from 'react'

import {
  Props as RootProps,
} from './components/Root'
import {
  CardProps,
  CreatureOnSquareProps,
  Props as BattlePageProps,
} from './components/pages/BattlePage'
import {
  ApplicationState,
  BattlePageState,
  Card as CardState,
  Creature as CreatureState,
  areGlobalPositionsEqual,
  determineRelationshipBetweenFactions,
  findCardByCreatureId,
  findCreatureById,
  findCreatureWithParty,
} from './utils'
import {
  proceedTurn,
  touchBattleFieldElement,
} from './reducers'

type ReactSetState = React.Dispatch<React.SetStateAction<ApplicationState>>

const jobIdToDummyImage = (jobId: string): string => {
  const mapping: {
    [key: string]: string,
  } = {
    archer: '弓',
    fighter: '戦',
    goblin: 'ゴ',
    knight: '重',
    mage: '魔',
    orc: 'オ',
  }
  return mapping[jobId] || '？'
}

function cardStateToProps(
  creaturesState: CreatureState[],
  cardsState: CardState[],
  creatureIdState: CreatureState['id']
): CardProps {
  const cardState = findCardByCreatureId(cardsState, creatureIdState)
  const creatureState = findCreatureById(creaturesState, creatureIdState)

  const cardProps = {
    uid: cardState.creatureId,
    skillCategorySymbol: '？',
    creatureImage: jobIdToDummyImage(creatureState.jobId),
  };


  const skillCategoryMapping: {
    [key: string]: string,
  } = {
    attack: 'A',
    healing: 'H',
    support: 'S',
  }
  cardProps.skillCategorySymbol = skillCategoryMapping[cardState.skillCategoryId]

  return cardProps
}


// TODO: Memoize some props for React.memo

function mapBattlePageStateToProps(
  battlePageState: BattlePageState,
  setState: ReactSetState
): BattlePageProps {
  const gameState = battlePageState.game

  const battleFieldBoard: BattlePageProps['battleFieldBoard'] = gameState.battleFieldMatrix.map(rowState => {
    return rowState.map(elementState => {
      const creatureWithPartyState = elementState.creatureId ?
        findCreatureWithParty(gameState.creatures, gameState.parties, elementState.creatureId) : undefined

      let creature: CreatureOnSquareProps | undefined = undefined
      if (creatureWithPartyState) {
        creature = {
          image: jobIdToDummyImage(creatureWithPartyState.creature.jobId),
          factionRelationshipId: determineRelationshipBetweenFactions(
            'player', creatureWithPartyState.party.factionId),
          lifePoint: creatureWithPartyState.creature.lifePoint.toString(),
        }
      }

      return {
        y: elementState.position.y,
        x: elementState.position.x,
        creature,
        isSelected: gameState.squareCursor
          ? areGlobalPositionsEqual(elementState.globalPosition, gameState.squareCursor.globalPosition)
          : false,
        handleTouch({y, x}) {
          setState(s => touchBattleFieldElement(s, y, x))
        },
      }
    })
  })

  return {
    battleFieldBoard,
    cardsOnYourHand: {
      cards: gameState.cardCreatureIdsOnYourHand
        .map(creatureIdState => cardStateToProps(gameState.creatures, gameState.cards, creatureIdState)),
    },
    handleClickNextButton: () => {
      setState(s => proceedTurn(s))
    },
  }
}

export function mapStateToProps(
  state: ApplicationState,
  setState: ReactSetState
): RootProps {
  if (state.pages.battle) {
    return {
      pages: {
        battle: mapBattlePageStateToProps(state.pages.battle, setState),
      },
    }
  }

  throw new Error('Received invalid state.')
}
