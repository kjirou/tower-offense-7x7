type FactionId = 'ally' | 'enemy';

export type Creature = {
  attackPoint: number,
  lifePoint: number,
  id: string,
  jobId: string,
}

export type Party = {
  factionId: FactionId,
  creatureIds: Creature['id'][],
}

export type MatrixId = 'battleField' | 'barrack';

export type GlobalMatrixPosition = {
  matrixId: MatrixId,
  x: number,
  y: number,
}

export type BattleFieldElement = {
  creatureId: Creature['id'] | undefined,
  position: GlobalMatrixPosition,
}

export type BattleFieldMatrix = BattleFieldElement[][];

export type NormalAttackContext = {
  attackerCreatureId: string,
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
}

export function identifyMatrixId(matrixIdLike: string): MatrixId {
  if (matrixIdLike === 'barrack') {
    return 'barrack';
  } else if (matrixIdLike === 'battleField') {
    return 'battleField';
  }
  throw new Error('It is not a MatrixId.');
}
