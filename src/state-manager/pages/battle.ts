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
