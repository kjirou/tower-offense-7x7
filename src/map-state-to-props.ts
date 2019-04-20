import {RootProps} from './components/Root';
import {ApplicationState} from './state-manager';

export function mapStateToProps(
  state: ApplicationState,
  setState: (state: ApplicationState) => void
): RootProps {
  const props = {};

  if (state.pages.battle) {
    const page = state.pages.battle;
    const battleFieldBoard = page.game.battleFieldMatrix.map(row => {
      return row.map(element => {
        return Object.assign({}, element);
      });
    });

    const barrackBoard = page.game.barrackMatrix.map(row => {
      return row.map(element => {
        return Object.assign({}, element);
      });
    });

    return {
      pages: {
        battle: {
          battleFieldBoard,
          barrackBoard,
        },
      },
    };
  }

  throw new Error('Received invalid state.');
}
