import * as React from 'react';

import {
  Root,
  Props as RootProps
} from './Root';
import {ApplicationState} from '../state-manager';

function mapStateToProps(state: ApplicationState): RootProps {
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

export function App(props: {initialState: ApplicationState}): JSX.Element {
  const [state, setState] = React.useState(props.initialState);

  const rootProps = mapStateToProps(state);

  return <Root {...rootProps} />;
}
