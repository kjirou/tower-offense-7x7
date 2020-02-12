/*
 * This file MUST NOT depend on any file in the project.
 */

type FactionId = 'player' | 'computer'

export type FactionRelationshipId = 'ally' | 'enemy'

export type SkillCategoryId = 'attack' | 'healing' | 'support'

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

export type Card = {
  // This is unique.
  creatureId: Creature['id'],
  skillCategoryId: SkillCategoryId,
}

export type MatrixPosition = {
  x: number,
  y: number,
}

type GlobalPlacementId = 'battleFieldMatrix' | 'cardsOnYourHand'

// TODO: -> "BattleFieldElementPosition" ?
type BattleFieldMatrixPosition = {
  globalPlacementId: 'battleFieldMatrix',
  x: MatrixPosition['x'],
  y: MatrixPosition['y'],
}

// TODO: -> "CardPosition" ?
type CardsOnYourHandPosition = {
  // TODO: -> "creatureId" ?
  cardCreatureId: Creature['id'],
  globalPlacementId: 'cardsOnYourHand',
}

export type GlobalPosition = BattleFieldMatrixPosition | CardsOnYourHandPosition

export function isBattleFieldMatrixPositionType(
  globalPosition: GlobalPosition
): globalPosition is BattleFieldMatrixPosition  {
  return globalPosition.globalPlacementId === 'battleFieldMatrix'
}

export function isCardsOnYourHandPositionType(
  globalPosition: GlobalPosition
): globalPosition is CardsOnYourHandPosition {
  return globalPosition.globalPlacementId === 'cardsOnYourHand'
}

export type BattleFieldElement = {
  creatureId: Creature['id'] | undefined,
  globalPosition: GlobalPosition,
  position: MatrixPosition,
}

export type BattleFieldMatrix = BattleFieldElement[][];

export type CreatureWithParty = {
  creature: Creature,
  party: Party,
}

export type CreatureWithPartyOnBattleFieldElement = {
  creature: Creature,
  party: Party,
  battleFieldElement: BattleFieldElement,
}

type SquareCursor = {
  globalPosition: GlobalPosition,
}

export type NormalAttackContext = {
  attackerCreatureId: Creature['id'],
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
  parties: Party[],
}

export type GameState = {
  battleFieldMatrix: BattleFieldMatrix,
  // TODO: Max 5 cards
  cardCreatureIdsOnYourHand: Creature['id'][],
  cards: Card[],
  creatures: Creature[],
  parties: Party[],
  squareCursor: SquareCursor | undefined,
}

export type BattlePage = {
  game: GameState,
}

export type ApplicationState = {
  pages: {
    battle?: BattlePage,
  },
}

/**
 * Validate that the matrix is not empty and is rectangular
 */
export function validateMatrix<Element>(matrix: Element[][]): boolean {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    Array.isArray(matrix[0]) &&
    matrix[0].length > 0 &&
    matrix.every((row: Element[]) => row.length === matrix[0].length)
  );
}

export function flattenMatrix<Element>(matrix: Element[][]): Element[] {
  const flattened: Element[] = [];

  matrix.forEach(row => {
    row.forEach(element => {
      flattened.push(element);
    });
  });
  return flattened;
}

export function areGlobalPositionsEqual(a: GlobalPosition, b: GlobalPosition): boolean {
  if (isBattleFieldMatrixPositionType(a) && isBattleFieldMatrixPositionType(b)) {
    return a.y === b.y && a.x === b.x
  } else if (isCardsOnYourHandPositionType(a) && isCardsOnYourHandPositionType(b)) {
    return a.cardCreatureId === b.cardCreatureId
  }
  return false
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

export function findCreatureWithParty(
  creatures: Creature[],
  parties: Party[],
  creatureId: Creature['id']
): CreatureWithParty {
  for (let partyIndex = 0; partyIndex < parties.length; partyIndex++) {
    const party = parties[partyIndex]
    for (let creatureIdIndex = 0; creatureIdIndex < party.creatureIds.length; creatureIdIndex++) {
      const creatureIdInLoop = party.creatureIds[creatureIdIndex]
      if (creatureId === creatureIdInLoop) {
        const creature = findCreatureById(creatures, creatureIdInLoop)
        return {
          creature,
          party,
        }
      }
    }
  }
  throw new Error('Can not find the `creatureId` from `parties`.')
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
          globalPlacementId: 'battleFieldMatrix',
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

export function findCardByCreatureId(cards: Card[], creatureId: Creature['id']): Card {
  for (const card of cards) {
    if (card.creatureId === creatureId) {
      return card
    }
  }
  throw new Error('Can not find the card.')
}

export function measureDistance(from: MatrixPosition, to: MatrixPosition): number {
  const deltaY = from.y > to.y ? from.y - to.y : to.y - from.y
  const deltaX = from.x > to.x ? from.x - to.x : to.x - from.x
  return Math.abs(deltaY) + Math.abs(deltaX)
}

export function findBattleFieldElementsByDistance(
  matrix: BattleFieldMatrix,
  startPoint: MatrixPosition,
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

export function pickBattleFieldElementsWhereCreatureExists(
  battleFieldMatrix: BattleFieldMatrix
): BattleFieldElement[] {
  const elements = []
  for (const row of battleFieldMatrix) {
    for (const element of row) {
      if (element.creatureId !== undefined) {
        elements.push(element)
      }
    }
  }
  return elements
}
