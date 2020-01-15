type FactionId = 'ally' | 'enemy';
type MatrixId = 'battleField' | 'barrack';

export function identifyMatrixId(matrixIdLike: string): MatrixId {
  if (matrixIdLike === 'barrack') {
    return 'barrack';
  } else if (matrixIdLike === 'battleField') {
    return 'battleField';
  }
  throw new Error('It is not a MatrixId');
}

type Creature = {
  attackPoint: number,
  lifePoint: number,
  id: string,
  jobId: string,
}

type GlobalMatrixPosition = {
  matrixId: MatrixId,
  x: number,
  y: number,
};

// A selection data of the square
//
// The "square" means an element of some matrices.
type SquareCursor = {
  position: {
    matrixId: 'battleField' | 'barrack',
    x: GlobalMatrixPosition['x'],
    y: GlobalMatrixPosition['y'],
  },
};

type Party = {
  factionId: FactionId,
  creatureIds: Creature['id'][],
}

type BattleFieldElementState = {
  creatureId: Creature['id'] | undefined,
  position: GlobalMatrixPosition,
}

type BattleFieldMatrixState = BattleFieldElementState[][];

type CreatureCard = {
  creatureId: Creature['id'],
  uid: string,
}

type SkillCard = {
  skillId: 'attack' | 'healing' | 'support',
  uid: string,
}

export type Card = CreatureCard | SkillCard;

export function isCreatureCardType(card: Card): card is CreatureCard {
  return 'creatureId' in card;
}

export function isSkillCardType(card: Card): card is SkillCard {
  return 'skillId' in card;
}

type CardsOnYourHandState = {
  cards: [Card, Card, Card, Card, Card],
};

export type GameState = {
  battleFieldMatrix: BattleFieldMatrixState,
  cardsOnYourHand: CardsOnYourHandState,
  creatures: Creature[],
  parties: Party[],
  squareCursor: SquareCursor | undefined,
}

function findCreatureById(creatures: Creature[], creatureId: Creature['id']): Creature | void {
  return creatures.find(creature => creature.id === creatureId);
}

export function findCreatureByIdOrError(creatures: Creature[], creatureId: Creature['id']): Creature {
  const found = findCreatureById(creatures, creatureId);
  if (!found) {
    throw new Error('Can not found a creature.');
  }
  return found;
}

export function areGlobalMatrixPositionsEqual(a: GlobalMatrixPosition, b: GlobalMatrixPosition): boolean {
  return a.matrixId === b.matrixId &&
    a.y === b.y &&
    a.x === b.x;
}

function createDummyAllies(
  battleFieldMatrix: BattleFieldMatrixState
): {
  creatures: Creature[],
  party: Party,
} {
  const creatures = [
    {
      id: 'ally-1',
      jobId: 'fighter',
      lifePoint: 12,
      attackPoint: 4,
    },
    {
      id: 'ally-2',
      jobId: 'knight',
      lifePoint: 18,
      attackPoint: 2,
    },
    {
      id: 'ally-3',
      jobId: 'archer',
      lifePoint: 6,
      attackPoint: 3,
    },
    {
      id: 'ally-4',
      jobId: 'mage',
      lifePoint: 3,
      attackPoint: 3,
    },
    {
      id: 'ally-5',
      jobId: 'fighter',
      lifePoint: 12,
      attackPoint: 4,
    },
    {
      id: 'ally-6',
      jobId: 'mage',
      lifePoint: 3,
      attackPoint: 3,
    },
  ];

  // Overwrite args
  battleFieldMatrix[2][1].creatureId = creatures[5].id;
  battleFieldMatrix[3][2].creatureId = creatures[4].id;

  const creatureIds = creatures.map(e => e.id);

  return {
    creatures,
    party: {
      factionId: 'ally',
      creatureIds,
    },
  };
}

export function createInitialGameState(): GameState {
  const battleFieldMatrix: BattleFieldMatrixState = [];
  for (let y = 0; y < 7; y++) {
    const row: BattleFieldElementState[] = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        position: {
          matrixId: 'battleField',
          y,
          x,
        },
        creatureId: undefined,
      });
    }
    battleFieldMatrix.push(row);
  }

  const cardsOnYourHand: CardsOnYourHandState = {
    cards: [
      {
        uid: 'card-1',
        skillId: 'attack',
      },
      {
        uid: 'card-2',
        skillId: 'healing',
      },
      {
        uid: 'card-3',
        skillId: 'attack',
      },
      {
        uid: 'card-4',
        skillId: 'attack',
      },
      {
        uid: 'card-5',
        skillId: 'support',
      },
    ],
  };

  const dummyAllies = createDummyAllies(battleFieldMatrix);

  return {
    creatures: dummyAllies.creatures,
    parties: [
      dummyAllies.party,
    ],
    battleFieldMatrix,
    cardsOnYourHand,
    squareCursor: undefined,
  };
}
