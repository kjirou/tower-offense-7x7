import {RootProps} from './components/Root';
import {BattlePageProps} from './components/pages/BattlePage';
import {ApplicationState} from './state-manager/application';
import {BattlePageState} from './state-manager/pages/battle';

export type ApplicationStateSetter = (applicationState: ApplicationState) => void;

function mapBattlePageStateToProps(
  state: BattlePageState,
  applicationState: ApplicationState,
  applicationStateSetter: ApplicationStateSetter
): BattlePageProps {
  const battleFieldBoard = state.game.battleFieldMatrix.map(row => {
    return row.map(element => {
      return Object.assign({}, element);
    });
  });

  const barrackBoard = state.game.barrackMatrix.map(row => {
    return row.map(element => {
      return Object.assign({}, element);
    });
  });

  return {
    battleFieldBoard,
    barrackBoard,
  };
}

export function mapStateToProps(
  state: ApplicationState,
  stateSetter: ApplicationStateSetter
): RootProps {
  if (state.pages.battle) {
    return {
      pages: {
        battle: mapBattlePageStateToProps(state.pages.battle, state, stateSetter),
      },
    };
  }

  throw new Error('Received invalid state.');
}
