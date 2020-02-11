import * as React from 'react'

import {
  FactionRelationshipId,
  flattenMatrix,
} from '../../utils'

const MetaInformationBar: React.FC<{}> = () => {
  const style = {
    position: 'relative',
    width: '360px',
    height: '48px',
    backgroundColor: 'yellow',
  }

  return (
    <div style={style}>MetaInformationBar!</div>
  )
}

export type CreatureOnSquareProps = {
  factionRelationshipId: FactionRelationshipId,
  image: string,
  lifePoint: string,
}

const CreatureOnSquare: React.FC<CreatureOnSquareProps> = (props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '48px',
        height: '48px',
        color: props.factionRelationshipId == 'ally' ? 'black' : 'red'
      }}
    >
      <div
        style={{
          lineHeight: '48px',
          fontSize: '24px',
          textAlign: 'center',
        }}
      >{props.image}</div>
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          right: '1px',
          fontSize: '10px',
          lineHeight: '12px',
          textAlign: 'right',
        }}
      >{props.lifePoint}</div>
    </div>
  )
}

type BattleFieldSquareProps = {
  creature: CreatureOnSquareProps | void,
  handleTouch: (payload: {
    x: number,
    y: number,
  }) => void,
  isSelected: boolean,
  x: number,
  y: number,
}

const BattleFieldSquare: React.FC<BattleFieldSquareProps> = (props) => {
  const style = {
    position: 'absolute',
    top: `${6 + props.y * 48 + props.y * 2}px`,
    left: `${6 + props.x * 48 + props.x * 2}px`,
    width: '48px',
    height: '48px',
    backgroundColor: props.isSelected ? 'yellow' : 'lime',
  }

  return (
    <div
      style={style}
      onTouchStart={() => props.handleTouch({x: props.x, y: props.y})}
    >
    {
      props.creature ? <CreatureOnSquare {...props.creature} /> : undefined
    }
    </div>
  )
}

type BattleFieldBoardProps = {
  board: BattleFieldSquareProps[][],
}

const BattleFieldBoard: React.FC<BattleFieldBoardProps> = (props) => {
  const style = {
    position: 'relative',
    width: '360px',
    height: '360px',
    backgroundColor: 'green',
  }

  const squares = flattenMatrix<BattleFieldSquareProps>(props.board)

  return (
    <div style={style}>
    {
      squares.map((square) => {
        const key = `square-${square.y}-${square.x}`;
        return <BattleFieldSquare key={key} {...square} />;
      })
    }
    </div>
  )
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
  )
}

export type CardProps = {
  creatureImage: string,
  isSelected: boolean,
  skillCategorySymbol: string,
  uid: string,
}

const Card: React.FC<CardProps> = (props) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '68px',
        height: '100px',
        backgroundColor: 'lime',
      }}
    >
      {
        props.isSelected
          ? <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 1,
              border: 'solid 4px yellow',
              opacity: '0.8',
            }}
          />
          : null
      }
      <div
        style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '100%',
          height: '16px',
          fontSize: '16px',
          lineHeight: '16px',
          textAlign: 'right',
        }}
      >
        {props.skillCategorySymbol}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '0',
          width: '100%',
          height: '24px',
          lineHeight: '24px',
          fontSize: '24px',
          textAlign: 'center',
        }}
      >{props.creatureImage}</div>
    </div>
  )
}

type CardsOnYourHandProps = {
  // 0 to 5 cards.
  cards: CardProps[],
}

const CardsOnYourHand: React.FC<CardsOnYourHandProps> = (props) => {
  const style = {
    display: 'flex',
    width: '360px',
    height: '112px',
    padding: '6px',
    justifyContent: 'space-between',
    backgroundColor: 'green',
  }

  return (
    <div style={style}>
    {
      props.cards.map((card) => {
        const key = `card-${card.uid}`;
        return <Card key={key} {...card} />;
      })
    }
    </div>
  )
}

type FooterProps = {
  handleClickNextButton: () => void,
}

const Footer: React.FC<FooterProps> = (props) => {
  const style = {
    display: 'flex',
    width: '360px',
    height: '56px',
    padding: '4px',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'aqua',
  }

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
      <div
        style={{
          width: '136px',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'lime',
        }}
        onClick={props.handleClickNextButton}
      >
        <div
          style={{
            fontSize: '24px',
          }}
        >Next</div>
      </div>
    </div>
  )
}

export type Props = {
  battleFieldBoard: BattleFieldSquareProps[][],
  cardsOnYourHand: CardsOnYourHandProps,
  handleClickNextButton: FooterProps['handleClickNextButton'],
}

export const BattlePage: React.FC<Props> = (props) => {
  const style = {
    position: 'relative',
    width: '360px',
    height: '640px',
    backgroundColor: 'silver',
  }

  return (
    <div style={style}>
      <MetaInformationBar />
      <BattleFieldBoard board={props.battleFieldBoard} />
      <SquareMonitor />
      <CardsOnYourHand {...props.cardsOnYourHand} />
      <Footer
        handleClickNextButton={props.handleClickNextButton}
      />
    </div>
  )
}
