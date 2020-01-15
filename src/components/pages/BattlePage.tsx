import * as React from 'react';

import {flattenMatrix} from '../../utils';

type CreatureOnSquareProps = {
  image: string,
};

type BattleFieldSquareProps = {
  creature: CreatureOnSquareProps | void,
  handleTouch: (payload: {
    x: number,
    y: number,
  }) => void,
  isSelected: boolean,
  x: number,
  y: number,
};

type BattleFieldProps = {
  board: BattleFieldSquareProps[][],
};

type BarrackSquareProps = {
  creature: CreatureOnSquareProps | void,
  handleTouch: (payload: {
    x: number,
    y: number,
  }) => void,
  isSelected: boolean,
  x: number,
  y: number,
};

type CardProps = {
  label: string,
  uid: string,
};

type CardsOnYourHandProps = {
  cards: [CardProps, CardProps, CardProps, CardProps, CardProps],
};

export type BattlePageProps = {
  barrackBoard: BarrackSquareProps[][],
  battleFieldBoard: BattleFieldSquareProps[][],
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

function CreatureOnSquare(props: CreatureOnSquareProps): JSX.Element {
  const style = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '48px',
    height: '48px',
    lineHeight: '48px',
    fontSize: '24px',
    textAlign: 'center',
  };

  return <div style={style}>{props.image}</div>
}

function BattleFieldSquare(props: BattleFieldSquareProps): JSX.Element {
  const style = {
    position: 'absolute',
    top: `${6 + props.y * 48 + props.y * 2}px`,
    left: `${6 + props.x * 48 + props.x * 2}px`,
    width: '48px',
    height: '48px',
    backgroundColor: props.isSelected ? 'yellow' : 'lime',
  };

  return (
    <div
      style={style}
      onTouchStart={() => props.handleTouch({x: props.x, y: props.y})}
    >
    {
      props.creature ? <CreatureOnSquare {...props.creature} /> : undefined
    }
    </div>
  );
}

function BattleFieldBoard(props: BattleFieldProps): JSX.Element {
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
        return <BattleFieldSquare key={key} {...square} />;
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

//function BarrackSquare(props: BarrackSquareProps): JSX.Element {
//  const style = {
//    position: 'absolute',
//    top: `${6 + props.y * 48 + props.y * 2}px`,
//    left: `${6 + props.x * 48 + props.x * 2}px`,
//    width: '48px',
//    height: '48px',
//    backgroundColor: props.isSelected ? 'yellow' : 'lime',
//  };
//
//  return (
//    <div
//      style={style}
//      onTouchStart={() => props.handleTouch({x: props.x, y: props.y})}
//    >
//    {
//      props.creature ? <CreatureOnSquare {...props.creature} /> : undefined
//    }
//    </div>
//  );
//}

function Card(props: CardProps): JSX.Element {
  const style = {
    width: '68px',
    height: '100px',
    backgroundColor: 'lime',
  };

  return (
    <div
      style={style}
    >
    </div>
  );
}

function CardsOnYourHand(props: {}): JSX.Element {
  const style = {
    display: 'flex',
    width: '360px',
    height: '112px',
    padding: '6px',
    justifyContent: 'space-between',
    backgroundColor: 'green',
  };

  // TODO: Dummy data
  const cards: CardsOnYourHandProps['cards'] = [
    {
      uid: 'a',
      label: '１',
    },
    {
      uid: 'b',
      label: '２',
    },
    {
      uid: 'c',
      label: '３',
    },
    {
      uid: 'd',
      label: '４',
    },
    {
      uid: 'e',
      label: '５',
    },
  ];


  return (
    <div style={style}>
    {
      cards.map((card) => {
        const key = `card-${card.uid}`;
        return <Card key={key} {...card} />;
      })
    }
    </div>
  );

  //return (
  //  <div style={style}>
  //  {
  //    squares.map((square) => {
  //      const key = `square-${square.y}-${square.x}`;
  //      return <BarrackSquare key={key} {...square} />;
  //    })
  //  }
  //  </div>
  //);
}

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
      <CardsOnYourHand />
    </div>
  );
}
