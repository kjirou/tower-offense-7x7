import produce from 'immer';
import * as React from 'react';

import {RootProps} from './components/Root';
import {BattlePageProps} from './components/pages/BattlePage';
import {ApplicationState} from './state-manager/application';
import {
  areGlobalMatrixPositionsEqual,
  findCreatureByIdOrError,
} from './state-manager/game';
import {BattlePageState} from './state-manager/pages/battle';

type ReactSetState<State> = (setStateAction: React.SetStateAction<State>) => void;
type Dispatcher<State> = (immerCallback: (draft: State) => void) => void;

function makeOneTimeApplicationDispatcher(
  setState: ReactSetState<ApplicationState>
): Dispatcher<ApplicationState> {
  let callCount = 0;
  return function dispatcher(immerCallback) {
    if (callCount > 0) {
      throw new Error('Can only call the dispatcher once in one Flux cycle.');
    }
    callCount++;
    setState(applicationState => {
      return produce(applicationState, immerCallback);
    });
  }
}

function makeScopedOneTimeDispatcher<OriginalState, ScopedState>(
  originalDispatcher: Dispatcher<OriginalState>,
  scoping: (state: OriginalState) => ScopedState | void,
): Dispatcher<ScopedState> {
  return function dispatcher(immerLikeCallback) {
    originalDispatcher(draft => {
      const scopedState = scoping(draft);
      if (scopedState) {
        immerLikeCallback(scopedState);
      } else {
        throw new Error('Invalid state scoping.');
      }
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
        handleTouch(payload) {
          dispatcher(draft => {
            draft.game.squareCursor = {
              position: {
                matrixId: 'battleField',
                y: payload.y,
                x: payload.x,
              },
            };
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
        handleTouch(payload) {
          dispatcher(draft => {
            draft.game.squareCursor = {
              position: {
                matrixId: 'barrack',
                y: payload.y,
                x: payload.x,
              },
            };
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
  const oneTimeApplicationDispatcher = makeOneTimeApplicationDispatcher(setState);

  if (state.pages.battle) {
    const battlePageOneTimeDispatcher = makeScopedOneTimeDispatcher<ApplicationState, BattlePageState>(
      oneTimeApplicationDispatcher,
      (state) => state.pages.battle
    );

    return {
      pages: {
        battle: mapBattlePageStateToProps(state.pages.battle, battlePageOneTimeDispatcher),
      },
    };
  }

  throw new Error('Received invalid state.');
}
