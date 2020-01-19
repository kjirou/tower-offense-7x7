import produce from 'immer';

import {
  GameState,
  createInitialGameState,
} from '../game';
import {
  identifyMatrixId,
} from '../game/utils';

export type BattlePageState = {
  game: GameState,
};

export function createInitialBattlePageState(): BattlePageState {
  return {
    game: createInitialGameState(),
  };
}

export function selectBattleFieldSquare(state: BattlePageState, y: number, x: number): BattlePageState {
  return produce(state, draft => {
    const nextSquareCursor = draft.game.squareCursor &&
        y === draft.game.squareCursor.globalPosition.y &&
        x === draft.game.squareCursor.globalPosition.x
      ? undefined
      : {
        globalPosition: {
          matrixId: identifyMatrixId('battleField'),
          y,
          x,
        },
      }
    ;
    draft.game.squareCursor = nextSquareCursor;
  });
}
