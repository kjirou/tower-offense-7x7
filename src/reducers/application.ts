import {
  MatrixPosition,
} from '../utils';
import {
  BattlePageState,
  createInitialBattlePageState,
  selectBattleFieldSquare,
} from './pages/battle';

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

export function createInitialApplicationState(): ApplicationState {
  return {
    pages: {
      battle: createInitialBattlePageState(),
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
    battlePageState => selectBattleFieldSquare(battlePageState, y, x)
  );
}
