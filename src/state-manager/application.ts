import {
  BattlePageState,
  createInitialBattlePageState,
} from './pages/battle';

export type ApplicationState = {
  pages: {
    battle?: BattlePageState,
  },
}

export function createInitialApplicationState(): ApplicationState {
  return {
    pages: {
      battle: createInitialBattlePageState(),
    },
  };
}
