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
  attackerCreatureId: Creature['id'],
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
  parties: Party[],
}

export function identifyMatrixId(matrixIdLike: string): MatrixId {
  if (matrixIdLike === 'barrack') {
    return 'barrack';
  } else if (matrixIdLike === 'battleField') {
    return 'battleField';
  }
  throw new Error('It is not a MatrixId.');
}

function findCreatureById(creatures: Creature[], creatureId: Creature['id']): Creature | void {
  return creatures.find(creature => creature.id === creatureId);
}

// TODO: Rename to `findCreatureById` (and change the one above)
export function findCreatureByIdOrError(creatures: Creature[], creatureId: Creature['id']): Creature {
  const found = findCreatureById(creatures, creatureId);
  if (!found) {
    throw new Error('Can not found a creature.');
  }
  return found;
}

export function measureDistance(from: GlobalMatrixPosition, to: GlobalMatrixPosition): number {
  const deltaY = from.y > to.y ? from.y - to.y : to.y - from.y
  const deltaX = from.x > to.x ? from.x - to.x : to.x - from.x
  return Math.abs(deltaY) + Math.abs(deltaX)
}
