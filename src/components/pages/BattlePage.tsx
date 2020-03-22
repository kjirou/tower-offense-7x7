import * as React from 'react'

import {
  FactionRelationshipId,
  flattenMatrix,
} from '../../utils'

type MetaInformationBarProps = {
  headquartersLifePoints: number,
  turnNumber: number,
}

const MetaInformationBar: React.FC<MetaInformationBarProps> = (props) => {
  const style = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-start',
    width: '360px',
    height: '48px',
    backgroundColor: 'yellow',
  }

  return (
    <div style={style}>
      <div
        style={{
          width: '48px',
          height: '48px',
          lineHeight: '48px',
          fontSize: '24px',
          textAlign: 'center',
          backgroundColor: 'silver',
        }}
      >{props.turnNumber}</div>
      <div
        style={{
          marginLeft: '2px',
          width: '48px',
          height: '48px',
          lineHeight: '48px',
          fontSize: '24px',
          textAlign: 'center',
          backgroundColor: 'silver',
        }}
      >{props.headquartersLifePoints}</div>
    </div>
  )
}

export type CreatureOnElementProps = {
  factionRelationshipId: FactionRelationshipId,
  image: string,
  isReserved: boolean,
  lifePoints: string,
  turnsUntilRaid: number,
}

const CreatureOnElement: React.FC<CreatureOnElementProps> = (props) => {
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
          opacity: props.isReserved ? 0.5 : 1,
        }}
      >{props.image}</div>
      {
        props.factionRelationshipId === 'enemy'
          ? <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              paddingLeft: '1px',
              paddingRight: '1px',
              fontSize: '10px',
              lineHeight: '12px',
              textAlign: 'right',
              color: '#000',
              backgroundColor: props.turnsUntilRaid === 0
                ? 'red'
                : props.turnsUntilRaid === 1
                  ? 'yellow'
                  : '#fff'
            }}
          >{props.turnsUntilRaid}</div>
          : null
      }
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          paddingLeft: '1px',
          paddingRight: '1px',
          fontSize: '10px',
          lineHeight: '12px',
          textAlign: 'right',
        }}
      >{props.lifePoints}</div>
    </div>
  )
}

type BattleFieldElementProps = {
  creature: CreatureOnElementProps | void,
  isSelected: boolean,
  isTarget: boolean,
  isWithinRange: boolean,
  x: number,
  y: number,
}

const BattleFieldElement: React.FC<BattleFieldElementProps> = (props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${6 + props.y * 48 + props.y * 2}px`,
        left: `${6 + props.x * 48 + props.x * 2}px`,
        width: '48px',
        height: '48px',
        backgroundColor: props.isSelected ? 'yellow' : 'lime',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '48px',
          height: '48px',
          border: props.isTarget ? '2px solid white' : '',
          backgroundColor: props.isWithinRange ? 'rgba(255, 255, 0, .5)' : '',
        }}
      />
      {
        props.creature ? <CreatureOnElement {...props.creature} /> : undefined
      }
    </div>
  )
}

type BattleFieldBoardProps = {
  board: BattleFieldElementProps[][],
  handleTouch: (payload: {
    x: number,
    y: number,
  }) => void,
  updatesAreProhibited: boolean,
}

const BattleFieldBoard: React.FC<BattleFieldBoardProps> = (props) => {
  const style = {
    position: 'relative',
    width: '360px',
    height: '360px',
    backgroundColor: 'green',
  }

  const elements = flattenMatrix<BattleFieldElementProps>(props.board)

  return (
    <div style={style}>
      <div
        style={{
          position: 'absolute',
          // TODO: 座標計算を整理する。
          top: '5px',
          left: '5px',
          width: '350px',
          height: '350px',
          zIndex: 1,
          opacity: props.updatesAreProhibited ? 0.25 : 0,
          backgroundColor: 'silver',
        }}
        onTouchStart={(event) => {
          const touch = event.changedTouches.item(0)
          // TODO: "as HTMLElement" が必要な理由が未調査。
          const rect = (event.target as HTMLElement).getBoundingClientRect()
          const touchY = touch.clientY - rect.top
          const touchX = touch.clientX - rect.left
          const y = Math.floor(Math.round(touchY) / 50)
          const x = Math.floor(Math.round(touchX) / 50)
          props.handleTouch({y, x})
        }}
      />
      {
        elements.map((element) => {
          const key = `battle-field-element-${element.y}-${element.x}`;
          return <BattleFieldElement key={key} {...element} />;
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
  creatureId: string,
  creatureImage: string,
  handleTouch: (creatureId: string) => void,
  isFirst: boolean,
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
        marginLeft: props.isFirst ? '0' : '2px',
        backgroundColor: 'lime',
      }}
      onTouchStart={() => {
        props.handleTouch(props.creatureId)
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

type CardsOnPlayersHandProps = {
  // 0 to 5 cards.
  cards: CardProps[],
}

const CardsOnPlayersHand: React.FC<CardsOnPlayersHandProps> = (props) => {
  const style = {
    display: 'flex',
    width: '360px',
    height: '112px',
    padding: '6px',
    justifyContent: 'flex-start',
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: 'green',
  }

  return (
    <div style={style}>
    {
      props.cards.map((card, index) => {
        const key = `card-${card.uid}`;
        return <Card
          key={key}
          {...card}
        />
      })
    }
    </div>
  )
}

type FooterProps = {
  actionPoints: number,
  progressButton: {
    label: string,
    handleTouch: () => void,
  },
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

  const rightSideButtonStyle = {
    width: '136px',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lime',
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
          fontSize: '20px',
        }}>Rollback</div>
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
        <div>{props.actionPoints}</div>
      </div>
      <div
        style={rightSideButtonStyle}
        onTouchStart={props.progressButton.handleTouch}
      >
        <div
          style={{
            fontSize: '20px',
          }}
        >{props.progressButton.label}</div>
      </div>
    </div>
  )
}

export type Props = {
  actionPoints: FooterProps['actionPoints'],
  battleFieldBoard: {
    board: BattleFieldElementProps[][],
    handleTouch: BattleFieldBoardProps['handleTouch'],
    updatesAreProhibited: boolean,
  },
  cardsOnPlayersHand: CardsOnPlayersHandProps,
  headquartersLifePoints: MetaInformationBarProps['headquartersLifePoints'],
  progressButton: FooterProps['progressButton'],
  turnNumber: MetaInformationBarProps['turnNumber'],
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
      <MetaInformationBar
        turnNumber={props.turnNumber}
        headquartersLifePoints={props.headquartersLifePoints}
      />
      <BattleFieldBoard {...props.battleFieldBoard} />
      <SquareMonitor />
      <CardsOnPlayersHand {...props.cardsOnPlayersHand} />
      <Footer
        actionPoints={props.actionPoints}
        progressButton={props.progressButton}
      />
    </div>
  )
}
