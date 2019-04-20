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

  return {
    game: {
      creatures: [],
      parties: [],
      battleFieldMatrix,
      barrackMatrix,
    },
  };
}
