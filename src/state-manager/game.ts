type FactionId = 'ally' | 'enemy';

type Creature = {
  attackPoint: number,
  lifePoint: number,
  id: string,
  jobId: string,
}

type CreatureSelection = {
  creatureId: Creature['id'] | void,
};

type Party = {
  factionId: FactionId,
  creatureIds: Creature['id'][],
}

type BattleFieldElementState = {
  creatureId: Creature['id'] | void,
  x: number,
  y: number,
}

type BattleFieldMatrixState = BattleFieldElementState[][];

type BarrackElementState = {
  creatureId: Creature['id'] | void,
  x: number,
  y: number,
}

type BarrackMatrixState = BarrackElementState[][];

export type GameState = {
  barrackMatrix: BarrackMatrixState,
  battleFieldMatrix: BattleFieldMatrixState,
  creatureSelection: CreatureSelection,
  creatures: Creature[],
  parties: Party[],
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

function createDummyAllies(
  battleFieldMatrix: BattleFieldMatrixState,
  barrackMatrix: BarrackMatrixState
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
  barrackMatrix[0][0].creatureId = creatures[0].id;
  barrackMatrix[0][1].creatureId = creatures[1].id;
  barrackMatrix[0][2].creatureId = creatures[2].id;
  barrackMatrix[0][3].creatureId = creatures[3].id;

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
    const row = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        y,
        x,
        creatureId: undefined,
      });
    }
    battleFieldMatrix.push(row);
  }

  const barrackMatrix: BarrackMatrixState = [];
  for (let y = 0; y < 2; y++) {
    const row = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        y,
        x,
        creatureId: undefined,
      });
    }
    barrackMatrix.push(row);
  }

  const dummyAllies = createDummyAllies(battleFieldMatrix, barrackMatrix);

  return {
    creatures: dummyAllies.creatures,
    creatureSelection: {
      creatureId: undefined,
    },
    parties: [
      dummyAllies.party,
    ],
    battleFieldMatrix,
    barrackMatrix,
  };
}
