import * as React from 'react';

import {flattenMatrix} from '../../utils';

type BattleFieldSquareProps = {
  x: number,
  y: number,
};

type BarrackSquareProps = {
  x: number,
  y: number,
};

function MetaInformationBar(): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '48px',
    backgroundColor: 'yellow',
  };

  return (
    <div style={style}>MetaInformationBar!</div>
  );
}

function BattleFieldSquare(props: BattleFieldSquareProps): JSX.Element {
  const style = {
    position: 'absolute',
    top: `${6 + props.y * 48 + props.y * 2}px`,
    left: `${6 + props.x * 48 + props.x * 2}px`,
    width: '48px',
    height: '48px',
    backgroundColor: 'lime',
  };

  return (
    <div style={style}>{`(${props.y},${props.x})`}</div>
  );
}

function BattleFieldBoard(props: {board: BattleFieldSquareProps[][]}): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '360px',
    backgroundColor: 'green',
  };

  const squares = flattenMatrix<BattleFieldSquareProps>(props.board);

  return (
    <div style={style}>
    {
      squares.map((square) => {
        const key = `square-${square.y}-${square.x}`;
        return <BattleFieldSquare key={key} y={square.y} x={square.x} />;
      })
    }
    </div>
  );
}

function SquareMonitor(): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '64px',
    backgroundColor: 'yellow',
  };

  return (
    <div style={style}>SquareMonitor!</div>
  );
}

function BarrackSquare(props: BarrackSquareProps): JSX.Element {
  const style = {
    position: 'absolute',
    top: `${6 + props.y * 48 + props.y * 2}px`,
    left: `${6 + props.x * 48 + props.x * 2}px`,
    width: '48px',
    height: '48px',
    backgroundColor: 'lime',
  };

  return (
    <div style={style}>{`(${props.y},${props.x})`}</div>
  );
}

function Barrack(props: {board: BarrackSquareProps[][]}): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '110px',
    backgroundColor: 'green',
  };

  const squares = flattenMatrix<BarrackSquareProps>(props.board);

  return (
    <div style={style}>
    {
      squares.map((square) => {
        const key = `square-${square.y}-${square.x}`;
        return <BarrackSquare key={key} y={square.y} x={square.x} />;
      })
    }
    </div>
  );
}

export type BattlePageProps = {
  battleFieldBoard: BattleFieldSquareProps[][],
  barrackBoard: BarrackSquareProps[][],
};

export function BattlePage(props: BattlePageProps): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '640px',
    backgroundColor: 'silver',
  };

  return (
    <div style={style}>
      <MetaInformationBar />
      <BattleFieldBoard board={props.battleFieldBoard} />
      <SquareMonitor />
      <Barrack board={props.barrackBoard} />
    </div>
  );
}
