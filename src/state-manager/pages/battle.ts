import produce from 'immer';

import {
  GameState,
  createInitialGameState,
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
  });
}
