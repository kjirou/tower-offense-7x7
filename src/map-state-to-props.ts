import produce, {Draft} from 'immer';
import * as React from 'react';

import {RootProps} from './components/Root';
import {
  BattlePageProps,
  CardProps,
} from './components/pages/BattlePage';
import {
  ApplicationState,
  updateBattlePageState,
} from './state-manager/application';
import {
  Card as CardState,
  areGlobalMatrixPositionsEqual,
  findCreatureByIdOrError,
  isCreatureCardType,
  isSkillCardType,
} from './state-manager/game';
import {
  BattlePageState,
  selectBattleFieldSquare,
} from './state-manager/pages/battle';

type ReactSetState = React.Dispatch<React.SetStateAction<ApplicationState>>;

function mapBattlePageStateToProps(
  state: BattlePageState,
  setState: ReactSetState
): BattlePageProps {
  function jobIdToDummyImage(jobId: string): string {
    const mapping: {
      [key: string]: string,
    } = {
      archer: '弓',
      fighter: '戦',
      knight: '重',
      mage: '魔',
    };
    return mapping[jobId] || '？';
  }

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

  const gameState = state.game;

  const battleFieldBoard: BattlePageProps['battleFieldBoard'] = gameState.battleFieldMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ?
        findCreatureByIdOrError(gameState.creatures, element.creatureId) : undefined;

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
        isSelected: gameState.squareCursor
          ? areGlobalMatrixPositionsEqual(element.position, gameState.squareCursor.position)
          : false,
        handleTouch({y, x}) {
          setState(applicationState_ => {
            return updateBattlePageState(
              applicationState_,
              battlePageState_ => selectBattleFieldSquare(battlePageState_, y, x)
            );
          });
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
