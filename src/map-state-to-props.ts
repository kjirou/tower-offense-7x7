import produce, {Draft} from 'immer'
import * as React from 'react'

import {
  Props as RootProps,
} from './components/Root'
import {
  CardProps,
  CreatureOnElementProps,
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
  runNormalAttackPhase,
  selectBattleFieldElement,
  selectCardOnPlayersHand,
} from './reducers'
// TODO: 直接読み込まない。
import {
  creatureUtils,
} from './reducers/utils'

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
    priest: '聖',
    orc: 'オ',
  }
  return mapping[jobId] || '？'
}

const skillCategoryIdToDummyImage = (skillCategoryId: SkillCategoryId): string => {
  const skillCategoryMapping: {
    [key: string]: string,
  } = {
    attack: 'A',
    defense: 'D',
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

  const boardProps: BattlePageProps['battleFieldBoard']['board'] = game.battleFieldMatrix.map(row => {
    return row.map(element => {
      const creatureWithParty = element.creatureId !== undefined
        ? findCreatureWithParty(game.creatures, game.parties, element.creatureId)
        : element.reservedCreatureId !== undefined
          ? findCreatureWithParty(game.creatures, game.parties, element.reservedCreatureId)
          : undefined

      let creatureProps: CreatureOnElementProps | undefined = undefined
      if (creatureWithParty) {
        creatureProps = {
          image: jobIdToDummyImage(creatureWithParty.creature.jobId),
          isReserved: element.reservedCreatureId !== undefined,
          factionRelationshipId: determineRelationshipBetweenFactions(
            'player', creatureWithParty.party.factionId),
          lifePoints: creatureWithParty.creature.lifePoints.toString(),
          raidInterval: creatureUtils.getRaidInterval(creatureWithParty.creature, game.jobs),
        }
      }

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creatureProps,
        isSelected: game.cursor
          ? areGlobalPositionsEqual(element.globalPosition, game.cursor.globalPosition)
          : false,
      }
    })
  })

  const cardsProps: CardProps[] = game.cardsOnPlayersHand
    .map(({creatureId}, index) => {
      const card = findCardByCreatureId(game.cards, creatureId)
      const creature = findCreatureById(game.creatures, creatureId)
      const asGlobalPosition: GlobalPosition = {
        globalPlacementId: 'cardsOnPlayersHand',
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
          setState(s => selectCardOnPlayersHand(s, creatureId))
        },
      }
    })

  const progressButton = game.battleResult.victoryOrDefeatId === 'pending'
    ? game.completedNormalAttackPhase
      ? {
        label: 'Next',
        handleTouch: () => {
          setState(s => proceedTurn(s))
        },
      }
      : {
        label: 'Battle',
        handleTouch: () => {
          setState(s => runNormalAttackPhase(s))
        },
      }
    : game.battleResult.victoryOrDefeatId === 'victory'
      ? {
        label: 'Victory!',
        handleTouch: () => {},
      }
      : {
        label: 'Defeat...',
        handleTouch: () => {},
      }

  return {
    battleFieldBoard: {
      board: boardProps,
      handleTouch({y, x}) {
        setState(s => selectBattleFieldElement(s, y, x))
      },
      updatesAreProhibited: game.battleResult.victoryOrDefeatId !== 'pending' || game.completedNormalAttackPhase,
    },
    cardsOnPlayersHand: {
      cards: cardsProps
    },
    headquartersLifePoints: game.headquartersLifePoints,
    turnNumber: game.turnNumber,
    progressButton,
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
