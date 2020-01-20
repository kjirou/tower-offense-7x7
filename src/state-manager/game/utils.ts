type FactionId = 'player' | 'computer';

type FactionRelationshipId = 'ally' | 'enemy';

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

export type MatrixPosition = {
  x: number,
  y: number,
}

export type MatrixId = 'battleField' | 'barrack';

// TODO: 手札がマトリックスではなくなったことからマトリックスはひとつになったので
//       GlobalPosition への変更が必要そう。
export type GlobalMatrixPosition = {
  matrixId: MatrixId,
  x: MatrixPosition['x'],
  y: MatrixPosition['y'],
}

export type BattleFieldElement = {
  creatureId: Creature['id'] | undefined,
  globalPosition: GlobalMatrixPosition,
  position: MatrixPosition,
}

export type BattleFieldMatrix = BattleFieldElement[][];

export type NormalAttackContext = {
  attackerCreatureId: Creature['id'],
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
  parties: Party[],
}

export function determineRelationshipBetweenFactions(a: FactionId, b: FactionId): FactionRelationshipId {
  return a === b ? 'ally' : 'enemy'
}

export function findCreatureByIdIfPossible(creatures: Creature[], creatureId: Creature['id']): Creature | undefined {
  return creatures.find(creature => creature.id === creatureId);
}

export function findCreatureById(creatures: Creature[], creatureId: Creature['id']): Creature {
  const found = findCreatureByIdIfPossible(creatures, creatureId);
  if (!found) {
    throw new Error('Can not found a creature.');
  }
  return found;
}

export function createBattleFieldMatrix(rowLength: number, columnLength: number): BattleFieldMatrix {
  const battleFieldMatrix: BattleFieldMatrix = []
  for (let y = 0; y < rowLength; y++) {
    const row: BattleFieldElement[] = [];
    for (let x = 0; x < columnLength; x++) {
      row.push({
        position: {
          y,
          x,
        },
        globalPosition: {
          matrixId: 'battleField',
          y,
          x,
        },
        creatureId: undefined,
      })
    }
    battleFieldMatrix.push(row)
  }
  return battleFieldMatrix;
}

export function findBattleFieldElementByCreatureId(
  matrix: BattleFieldMatrix,
  creatureId: Creature['id']
): BattleFieldElement {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x].creatureId === creatureId) {
        return matrix[y][x]
      }
    }
  }
  throw new Error('Can not find the `creatureId` on the `BattleFieldMatrix`.')
}

export function measureDistance(
  from: MatrixPosition | GlobalMatrixPosition,
  to: MatrixPosition | GlobalMatrixPosition
): number {
  const deltaY = from.y > to.y ? from.y - to.y : to.y - from.y
  const deltaX = from.x > to.x ? from.x - to.x : to.x - from.x
  return Math.abs(deltaY) + Math.abs(deltaX)
}

export function findBattleFieldElementsByDistance(
  matrix: BattleFieldMatrix,
  startPoint: MatrixPosition | GlobalMatrixPosition,
  distance: number
): BattleFieldElement[] {
  const elements: BattleFieldElement[] = []
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (measureDistance(startPoint, matrix[y][x].position) <= distance) {
        elements.push(matrix[y][x])
      }
    }
  }
  return elements
}
