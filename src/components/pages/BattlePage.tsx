import * as React from 'react';
import {
  DragLayer,
  DragSource,
} from 'react-dnd';

import {flattenMatrix} from '../../utils';

type CreatureOnSquareProps = {
  image: string,
};

type DraggableCreatureOnSquareProps = {
  // TODO: Although react-dnd exports types, there was no documentation on how to use it.
  connectDragSource: (element: JSX.Element) => any,
  image: CreatureOnSquareProps['image'],
  isDragging: boolean,
};

type BattleFieldSquareProps = {
  x: number,
  y: number,
  creature: CreatureOnSquareProps | void,
};

type BattleFieldProps = {
  board: BattleFieldSquareProps[][],
};

type BarrackSquareProps = {
  x: number,
  y: number,
  creature: CreatureOnSquareProps | void,
};

type BarrackProps = {
  board: BarrackSquareProps[][],
};

export type BattlePageProps = {
  battleFieldBoard: BattleFieldSquareProps[][],
  barrackBoard: BarrackSquareProps[][],
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

function DraggableCreatureOnSquare(props: DraggableCreatureOnSquareProps): JSX.Element {
  const style = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '48px',
    height: '48px',
  };
  console.log('isDragging:', props.isDragging);

  const creatureOnSquareProps: CreatureOnSquareProps = {
    image: props.image,
  };

  // NOTE: The div wrapping is needed against the following react-dnd's error.
  //       "Only native element nodes can now be passed to React DnD connectors."
  return props.connectDragSource(
    <div style={style}>
      <CreatureOnSquare {...creatureOnSquareProps} />
    </div>
  );
}

const DraggableCreatureOnSquareForBarrack = DragSource(
  'DraggableCreatureOnSquareForBarrack',
  {
    beginDrag: props => {
      return props;
    },
  },
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    };
  }
)(DraggableCreatureOnSquare);

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
    <div style={style}>
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
    <div style={style}>
    {
      props.creature ? <DraggableCreatureOnSquareForBarrack {...props.creature} /> : undefined
    }
    </div>
  );
}

function Barrack(props: BarrackProps): JSX.Element {
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
        return <BarrackSquare key={key} {...square} />;
      })
    }
    </div>
  );
}

function CreatureDragLayer(): any {
  function collect(monitor: any) {
    return {
      isDragging: monitor.isDragging(),
    };
  }

  function DragPreview(props: {isDragging: boolean}): JSX.Element {
    const style = {
    };

    if (!props.isDragging) {
      return <div />;
    }

    return (
      <div style={style}>
        Dragging...
      </div>
    );
  }

  return DragLayer(collect)(DragPreview);
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
      <Barrack board={props.barrackBoard} />
      <CreatureDragLayer />
    </div>
  );
}
