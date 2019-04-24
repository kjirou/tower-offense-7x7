import produce, {Draft} from 'immer';
import * as React from 'react';

import {RootProps} from './components/Root';
import {BattlePageProps} from './components/pages/BattlePage';
import {ApplicationState} from './state-manager/application';
import {
  areGlobalMatrixPositionsEqual,
  findCreatureByIdOrError,
  identifyMatrixId,
} from './state-manager/game';
import {BattlePageState} from './state-manager/pages/battle';

type ReactSetState<State> = (setStateAction: React.SetStateAction<State>) => void;
type Dispatcher<State> = (immerLikeCallback: (draft: Draft<State>) => void) => void;

function makeDispatcher<State, ScopedState>(
  setState: ReactSetState<State>,
  scoping: (state: Draft<State>) => Draft<ScopedState> | void,
): Dispatcher<ScopedState> {
  let callCount = 0;
  return function dispatcher(immerLikeCallback: (aPartOfDraft: Draft<ScopedState>) => void): void {
    if (callCount > 0) {
      throw new Error('Can only call the dispatcher once in one Flux cycle.');
    }
    callCount++;
    setState(applicationState => {
      return produce(applicationState, draft => {
        const scopedState = scoping(draft);
        if (scopedState) {
          immerLikeCallback(scopedState);
        } else {
          throw new Error('Invalid state scoping.');
        }
      });
    });
  }
}

function mapBattlePageStateToProps(
  state: BattlePageState,
  dispatcher: Dispatcher<BattlePageState>,
): BattlePageProps {
  const {
    barrackMatrix,
    battleFieldMatrix,
    creatures,
    squareCursor,
  } = state.game;

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

  const battleFieldBoard: BattlePageProps['battleFieldBoard'] = battleFieldMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ? findCreatureByIdOrError(creatures, element.creatureId) : undefined;

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
        isSelected: squareCursor
          ? areGlobalMatrixPositionsEqual(element.position, squareCursor.position)
          : false,
        handleTouch({y, x}) {
          dispatcher(draft => {
            const nextSquareCursor = draft.game.squareCursor &&
                x === draft.game.squareCursor.position.x &&
                y === draft.game.squareCursor.position.y
              ? undefined
              : {
                position: {
                  matrixId: identifyMatrixId('battleField'),
                  y,
                  x,
                },
              }
            ;
            draft.game.squareCursor = nextSquareCursor;
          });
        },
      };
    });
  });

  const barrackBoard: BattlePageProps['barrackBoard'] = barrackMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ? findCreatureByIdOrError(creatures, element.creatureId) : undefined;

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
        isSelected: squareCursor
          ? areGlobalMatrixPositionsEqual(element.position, squareCursor.position)
          : false,
        handleTouch({y, x}) {
          dispatcher(draft => {
            const nextSquareCursor = draft.game.squareCursor &&
                x === draft.game.squareCursor.position.x &&
                y === draft.game.squareCursor.position.y
              ? undefined
              : {
                position: {
                  matrixId: identifyMatrixId('barrack'),
                  y,
                  x,
                },
              }
            ;
            draft.game.squareCursor = nextSquareCursor;
          });
        },
      };
    });
  });

  return {
    battleFieldBoard,
    barrackBoard,
  };
}

export function mapStateToProps(
  state: ApplicationState,
  setState: ReactSetState<ApplicationState>
): RootProps {
  if (state.pages.battle) {
    const dispatcher = makeDispatcher<ApplicationState, BattlePageState>(
      setState,
      (state) => state.pages.battle
    );

    return {
      pages: {
        battle: mapBattlePageStateToProps(state.pages.battle, dispatcher),
      },
    };
  }

  throw new Error('Received invalid state.');
}
