import produce from 'immer';

import {
  GameState,
  createInitialGameState,
  identifyMatrixId,
} from '../game';

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
        y === draft.game.squareCursor.position.y &&
        x === draft.game.squareCursor.position.x
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
}
