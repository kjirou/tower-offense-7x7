import * as React from 'react';

import Root, {Props as RootProps} from './Root';
import {ApplicationState} from '../state-manager';

function mapStateToProps(state: ApplicationState): RootProps {
  const props = {};

  if (state.activatedPage.pageId === 'battle') {
    const game = state.activatedPage.game;
    if (game) {
      const battleFieldBoard = game.battleFieldMatrix.map(row => {
        return row.map(element => {
          return Object.assign({}, element);
        });
      });

      return {
        pages: {
          battle: {
            battleFieldBoard,
          },
        },
      };
    }
  }

  throw new Error('Received invalid state.');
}

export default function App(props: {initialState: ApplicationState}): JSX.Element {
  const [state, setState] = React.useState(props.initialState);

  const rootProps = mapStateToProps(state);

  return <Root {...rootProps} />;
}
