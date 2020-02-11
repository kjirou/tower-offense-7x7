import produce, {Draft} from 'immer';
import * as React from 'react';

import {
  Props as RootProps,
} from './components/Root';
import {
  CardProps,
  Props as BattlePageProps,
} from './components/pages/BattlePage';
import {
  ApplicationState,
  BattlePageState,
  Card as CardState,
  findCreatureById,
  isCreatureCardType,
  isSkillCardType,
  areGlobalMatrixPositionsEqual,
} from './utils';
import {
  proceedTurn,
  touchBattleFieldElement,
} from './reducers';

type ReactSetState = React.Dispatch<React.SetStateAction<ApplicationState>>;

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

// TODO: Memoize some props for React.memo

function mapBattlePageStateToProps(
  battlePageState: BattlePageState,
  setState: ReactSetState
): BattlePageProps {
  function cardStateToProps(cardState: CardState): CardProps {
    const cardProps = {
      uid: cardState.uid,
      label: '？',
    };

    if (isSkillCardType(cardState)) {
      const mapping: {
        [key: string]: string,
      } = {
        attack: 'A',
        healing: 'H',
        support: 'S',
      };
      cardProps.label = mapping[cardState.skillId];
    }

    return cardProps;
  }

  const gameState = battlePageState.game;

  const battleFieldBoard: BattlePageProps['battleFieldBoard'] = gameState.battleFieldMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ?
        findCreatureById(gameState.creatures, element.creatureId) : undefined;

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
        isSelected: gameState.squareCursor
          ? areGlobalMatrixPositionsEqual(element.globalPosition, gameState.squareCursor.globalPosition)
          : false,
        handleTouch({y, x}) {
          setState(s => touchBattleFieldElement(s, y, x));
        },
      };
    });
  });

  const cardsState = gameState.cardsOnYourHand.cards;
  const cardsOnYourHand: BattlePageProps['cardsOnYourHand'] = {
    cards: [
      cardStateToProps(cardsState[0]),
      cardStateToProps(cardsState[1]),
      cardStateToProps(cardsState[2]),
      cardStateToProps(cardsState[3]),
      cardStateToProps(cardsState[4]),
    ],
  };

  return {
    battleFieldBoard,
    cardsOnYourHand,
    handleClickNextButton: () => {
      setState(s => proceedTurn(s))
    },
  };
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
    };
  }

  throw new Error('Received invalid state.');
}
