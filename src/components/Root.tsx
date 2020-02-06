import * as React from 'react';

import {
  BattlePageProps,
  BattlePage,
} from './pages/BattlePage';

export type RootProps = {
  pages: {
    battle?: BattlePageProps,
  },
};

export const Root: React.FC<RootProps> = (props) => {
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
