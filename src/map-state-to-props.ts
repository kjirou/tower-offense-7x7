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
  BattlePage,
  GlobalPosition,
  SkillCategoryId,
  areGlobalPositionsEqual,
  determineRelationshipBetweenFactions,
  findCardByCreatureId,
  findCreatureById,
  findCreatureWithParty,
} from './utils'
import {
  proceedTurn,
  selectBattleFieldElement,
  selectCardOnYourHand,
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

const skillCategoryIdToDummyImage = (skillCategoryId: SkillCategoryId): string => {
  const skillCategoryMapping: {
    [key: string]: string,
  } = {
    attack: 'A',
    healing: 'H',
    support: 'S',
  }
  return skillCategoryMapping[skillCategoryId]
}

// TODO: Memoize some props for React.memo

function mapBattlePageStateToProps(
  battlePage: BattlePage,
  setState: ReactSetState
): BattlePageProps {
  const game = battlePage.game

  const battleFieldBoardProps: BattlePageProps['battleFieldBoard'] = game.battleFieldMatrix.map(row => {
    return row.map(element => {
      const creatureWithParty = element.creatureId ?
        findCreatureWithParty(game.creatures, game.parties, element.creatureId) : undefined

      let creatureProps: CreatureOnSquareProps | undefined = undefined
      if (creatureWithParty) {
        creatureProps = {
          image: jobIdToDummyImage(creatureWithParty.creature.jobId),
          factionRelationshipId: determineRelationshipBetweenFactions(
            'player', creatureWithParty.party.factionId),
          lifePoint: creatureWithParty.creature.lifePoint.toString(),
        }
      }

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creatureProps,
        isSelected: game.cursor
          ? areGlobalPositionsEqual(element.globalPosition, game.cursor.globalPosition)
          : false,
        handleTouch({y, x}) {
          setState(s => selectBattleFieldElement(s, y, x))
        },
      }
    })
  })

  const cardsProps: CardProps[] = game.cardsOnYourHand
    .map(({creatureId}, index) => {
      const card = findCardByCreatureId(game.cards, creatureId)
      const creature = findCreatureById(game.creatures, creatureId)
      const asGlobalPosition: GlobalPosition = {
        globalPlacementId: 'cardsOnYourHand',
        creatureId,
      }
      const isSelected = game.cursor
        ? areGlobalPositionsEqual(asGlobalPosition, game.cursor.globalPosition)
        : false
      return {
        uid: card.creatureId,
        creatureId,
        creatureImage: jobIdToDummyImage(creature.jobId),
        skillCategorySymbol: skillCategoryIdToDummyImage(card.skillCategoryId),
        isFirst: index === 0,
        isSelected,
        handleTouch: (creatureId: string) => {
          setState(s => selectCardOnYourHand(s, creatureId))
        },
      }
    })

  return {
    battleFieldBoard: battleFieldBoardProps,
    cardsOnYourHand: {
      cards: cardsProps
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
