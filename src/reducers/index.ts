import produce from 'immer'

import {
  GameState,
  MatrixPosition,
} from '../utils'
import {
  createInitialGameState,
} from './game';

export type BattlePageState = {
  game: GameState,
};

export type ApplicationState = {
  pages: {
    battle?: BattlePageState,
  },
}

function updateBattlePageState(
  applicationState: ApplicationState,
  updater: (battlePageState: BattlePageState) => BattlePageState
): ApplicationState {
  const battlePageState = applicationState.pages.battle;
  if (battlePageState) {
    return Object.assign(
      {},
      applicationState,
      {
        pages: {
          battle: updater(battlePageState),
        },
      }
    );
  }
  throw new Error('The `applicationState.pages.battle` does not exist.');
}

// TODO: Move to another place
export function createInitialApplicationState(): ApplicationState {
  return {
    pages: {
      battle: {
        game: createInitialGameState(),
      },
    },
  };
}

export function touchBattleFieldElement(
  applicationState: ApplicationState,
  y: MatrixPosition['y'],
  x: MatrixPosition['x']
): ApplicationState {
  return updateBattlePageState(
    applicationState,
    battlePageState => {
      return produce(battlePageState, draft => {
        if (
          draft.game.squareCursor &&
          y === draft.game.squareCursor.globalPosition.y &&
          x === draft.game.squareCursor.globalPosition.x
        ) {
          draft.game.squareCursor = undefined;
        } else {
          draft.game.squareCursor = {
            globalPosition: {
              matrixId: 'battleField',
              y,
              x,
            },
          }
        }
      })
    }
  )
}