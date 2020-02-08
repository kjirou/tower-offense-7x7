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

type BattleFieldBoardProps = {
  board: BattleFieldSquareProps[][],
};

export type CardProps = {
  label: string,
  uid: string,
};

type CardsOnYourHandProps = {
  cards: [CardProps, CardProps, CardProps, CardProps, CardProps],
};

export type Props = {
  battleFieldBoard: BattleFieldSquareProps[][],
  cardsOnYourHand: CardsOnYourHandProps,
};

const MetaInformationBar: React.FC<{}> = () => {
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

const CreatureOnSquare: React.FC<CreatureOnSquareProps> = (props) => {
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

const BattleFieldSquare: React.FC<BattleFieldSquareProps> = (props) => {
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

const BattleFieldBoard: React.FC<BattleFieldBoardProps> = (props) => {
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

const SquareMonitor: React.FC<{}> = () => {
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

const Card: React.FC<CardProps> = (props) => {
  const style = {
    width: '68px',
    height: '100px',
    backgroundColor: 'lime',
  };

  return (
    <div
      style={style}
    >
      {props.label}
    </div>
  );
}

const CardsOnYourHand: React.FC<CardsOnYourHandProps> = (props) => {
  const style = {
    display: 'flex',
    width: '360px',
    height: '112px',
    padding: '6px',
    justifyContent: 'space-between',
    backgroundColor: 'green',
  };

  return (
    <div style={style}>
    {
      props.cards.map((card) => {
        const key = `card-${card.uid}`;
        return <Card key={key} {...card} />;
      })
    }
    </div>
  );
}

const Footer: React.FC<{}> = () => {
  const style = {
    display: 'flex',
    width: '360px',
    height: '56px',
    padding: '4px',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'aqua',
  };

  return (
    <div style={style}>
      <div style={{
        width: '136px',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lime',
      }}>
        <div style={{
          fontSize: '24px',
        }}>Back</div>
      </div>
      <div style={{
        width: '72px',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '32px',
        backgroundColor: 'silver',
      }}>
        <div>5</div>
      </div>
      <div style={{
        width: '136px',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lime',
      }}>
        <div style={{
          fontSize: '24px',
        }}>Next</div>
      </div>
    </div>
  );
}

export const BattlePage: React.FC<Props> = (props) => {
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
      <CardsOnYourHand {...props.cardsOnYourHand} />
      <Footer />
    </div>
  );
}
