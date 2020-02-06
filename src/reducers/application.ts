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

export function updateBattlePageState(
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
