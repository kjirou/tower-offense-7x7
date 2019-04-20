import {
  BarrackMatrixState,
  BattleFieldMatrixState,
  GameState,
  createDummyAllies,
} from '../game';

export type BattlePageState = {
  game: GameState,
};

export function createInitialBattlePageState(): BattlePageState {
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
