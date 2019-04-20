type FactionId = 'ally' | 'enemy';

type Creature = {
  attackPoint: number,
  lifePoint: number,
  id: string,
  jobId: string,
}

type Party = {
  factionId: FactionId,
  creatureIds: Creature['id'][],
}

type BattleFieldElementState = {
  creatureId: Creature['id'] | void,
  x: number,
  y: number,
}

type BarrackElementState = {
  creatureId: Creature['id'] | void,
  x: number,
  y: number,
}

type GameState = {
  barrackMatrix: BarrackElementState[][],
  battleFieldMatrix: BattleFieldElementState[][],
  creatures: Creature[],
  parties: Party[],
}

export type BattlePageState = {
  game: GameState,
};

function createDummyAllies(barrackMatrix: BarrackElementState[][]): {
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
  ];
  const creatureIds = creatures.map(e => e.id);

  // Overwrite the arg
  creatureIds.forEach((creatureId, index) => {
    barrackMatrix[0][index].creatureId = creatureId;
  });

  return {
    creatures,
    party: {
      factionId: 'ally',
      creatureIds,
    },
  };
}

export function createInitialBattlePageState(): BattlePageState {
  const battleFieldMatrix: BattleFieldElementState[][] = [];
  for (let y = 0; y < 7; y++) {
    const row: BattleFieldElementState[] = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        y,
        x,
        creatureId: undefined,
      });
    }
    battleFieldMatrix.push(row);
  }

  const barrackMatrix: BarrackElementState[][] = [];
  for (let y = 0; y < 2; y++) {
    const row: BarrackElementState[] = [];
    for (let x = 0; x < 7; x++) {
      row.push({
        y,
        x,
        creatureId: undefined,
      });
    }
    barrackMatrix.push(row);
  }

  const dummyAllies = createDummyAllies(barrackMatrix);

  return {
    game: {
      creatures: dummyAllies.creatures,
      parties: [
        dummyAllies.party,
      ],
      battleFieldMatrix,
      barrackMatrix,
    },
  };
}
