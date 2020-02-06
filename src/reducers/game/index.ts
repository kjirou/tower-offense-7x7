import {
  BattleFieldElement,
  BattleFieldMatrix,
  Creature,
  GlobalMatrixPosition,
  MatrixId,
  Party,
  createBattleFieldMatrix,
  findCreatureById as findCreatureById_,
} from './utils';

export const findCreatureById = findCreatureById_;

// A selection data of the square
//
// The "square" means an element of some matrices.
type SquareCursor = {
  globalPosition: {
    matrixId: 'battleField' | 'barrack',
    x: GlobalMatrixPosition['x'],
    y: GlobalMatrixPosition['y'],
  },
};

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
  battleFieldMatrix: BattleFieldMatrix,
  cardsOnYourHand: CardsOnYourHandState,
  creatures: Creature[],
  parties: Party[],
  squareCursor: SquareCursor | undefined,
}

export function areGlobalMatrixPositionsEqual(a: GlobalMatrixPosition, b: GlobalMatrixPosition): boolean {
  return a.matrixId === b.matrixId &&
    a.y === b.y &&
    a.x === b.x;
}

const dummyAllCreatures: Creature[] = [
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
const dummyAllCreatureIds = dummyAllCreatures.map(e => e.id);
const dummyAllyParty: Party = {
  factionId: 'player',
  creatureIds: dummyAllCreatures
    .filter(e => /^ally-/.test(e.id))
    .map(e => e.id),
};

export function createInitialGameState(): GameState {
  const battleFieldMatrix = createBattleFieldMatrix(7, 7)

  battleFieldMatrix[2][1].creatureId = dummyAllCreatures[5].id;
  battleFieldMatrix[3][2].creatureId = dummyAllCreatures[4].id;

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

  return {
    creatures: dummyAllCreatures,
    parties: [
      dummyAllyParty,
    ],
    battleFieldMatrix,
    cardsOnYourHand,
    squareCursor: undefined,
  };
}
