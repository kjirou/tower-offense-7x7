import * as React from 'react';

import {
  BattlePage,
  Props as BattlePageProps,
} from './pages/BattlePage';

export type Props = {
  pages: {
    battle?: BattlePageProps,
  },
};

export const Root: React.FC<Props> = (props) => {
  const style = {
    position: 'relative',
    margin: '0 auto',
    width: '360px',
    height: '640px',
  };

  if (props.pages.battle) {
    return (
      <div style={style}><BattlePage {...props.pages.battle} /></div>
    );
  }

  throw new Error('Received invalid root props');
}
