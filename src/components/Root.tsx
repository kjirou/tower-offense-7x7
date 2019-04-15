import * as React from 'react';

type BattleFieldSquareProp = {
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

function BattleFieldSquare(props: BattleFieldSquareProp): JSX.Element {
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

function BattleFieldBoard(props: {board: BattleFieldSquareProp[][]}): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '360px',
    backgroundColor: 'green',
  };

  // TODO: flatten
  const flattened: BattleFieldSquareProp[] = [];
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

function BattlePage(): JSX.Element {
  const boardProps: BattleFieldSquareProp[][] = [];
  for (let y = 0; y < 7; y++) {
    const row: BattleFieldSquareProp[] = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        y,
        x,
      });
    }
    boardProps.push(row);
  }

  const style = {
    position: 'relative',
    width: '360px',
    height: '640px',
    backgroundColor: 'silver',
  };

  return (
    <div style={style}>
      <MetaInformationBar />
      <BattleFieldBoard board={boardProps} />
    </div>
  );
}

export default function Root(): JSX.Element {
  const style = {
    position: 'relative',
    margin: '0 auto',
    width: '360px',
    height: '640px',
  };

  return (
    <div style={style}><BattlePage /></div>
  );
}
