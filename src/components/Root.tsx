import * as React from 'react';

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

  // TODO: flatten
  const flattened: BattleFieldSquareProps[] = [];
  props.board.forEach(row => {
    row.forEach(square => {
      flattened.push(square);
    });
  });

  return (
    <div style={style}>
    {
      flattened.map((square) => {
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

  // TODO: flatten
  const flattened: BarrackSquareProps[] = [];
  props.board.forEach(row => {
    row.forEach(square => {
      flattened.push(square);
    });
  });

  return (
    <div style={style}>
    {
      flattened.map((square) => {
        const key = `square-${square.y}-${square.x}`;
        return <BarrackSquare key={key} y={square.y} x={square.x} />;
      })
    }
    </div>
  );
}

function BattlePage(props: {
  battleFieldBoard: BattleFieldSquareProps[][],
  barrackBoard: BarrackSquareProps[][],
}): JSX.Element {
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

export type Props = {
  pages: {
    battle?: {
      battleFieldBoard: BattleFieldSquareProps[][],
      barrackBoard: BarrackSquareProps[][],
    },
  },
};

export default function Root(props: Props): JSX.Element {
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
