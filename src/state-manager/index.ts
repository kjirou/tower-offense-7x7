type FactionId = 'ally' | 'enemy';

type Creature = {
  attackPoint: number,
  lifePoint: number,
  id: string,
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

type GameState = {
  battleFieldMatrix: BattleFieldElementState[][],
  creatures: Creature[],
  parties: Party[],
}

type BattlePageState = {
  game: GameState,
};

export type ApplicationState = {
  pages: {
    battle?: BattlePageState,
  },
}

export function createInitialApplicationState(): ApplicationState {
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

  return {
    pages: {
      battle: {
        game: {
          creatures: [],
          parties: [],
          battleFieldMatrix,
        },
      },
    },
  };
}
