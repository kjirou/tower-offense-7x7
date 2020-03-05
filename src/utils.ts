/*
 * This file MUST NOT depend on any file in the project.
 */

export type FactionId = 'player' | 'computer'

export type FactionRelationshipId = 'ally' | 'enemy'

export type SkillCategoryId = 'attack' | 'defense' | 'support'

export type Job = {
  attackPower: number,
  id: string,
  maxLifePoints: number,
  raidInterval: number,
  raidPower: number,
}

// This is the so-called “Active Skill”.
export type Skill = {
  id: string,
  skillCategoryId: SkillCategoryId,
}

export type Creature = {
  _attackPowerForTest?: number,
  _maxLifePointsForTest?: number,
  id: string,
  jobId: string,
  lifePoints: number,
  skillIds: Skill['id'][],
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

export type CardRelationship = {
  creatureId: Creature['id'],
}

export type MatrixPosition = {
  x: number,
  y: number,
}

type GlobalPlacementId = 'battleFieldMatrix' | 'cardsOnPlayersHand'

type BattleFieldElementPosition = {
  globalPlacementId: 'battleFieldMatrix',
  x: MatrixPosition['x'],
  y: MatrixPosition['y'],
}

type CardOnPlayersHandPosition = {
  creatureId: Creature['id'],
  globalPlacementId: 'cardsOnPlayersHand',
}

export type GlobalPosition = BattleFieldElementPosition | CardOnPlayersHandPosition

export function isBattleFieldMatrixPositionType(
  globalPosition: GlobalPosition
): globalPosition is BattleFieldElementPosition  {
  return globalPosition.globalPlacementId === 'battleFieldMatrix'
}

function isCardsOnPlayersHandPositionType(
  globalPosition: GlobalPosition
): globalPosition is CardOnPlayersHandPosition {
  return globalPosition.globalPlacementId === 'cardsOnPlayersHand'
}

export type BattleFieldElement = {
  creatureId: Creature['id'] | undefined,
  globalPosition: GlobalPosition,
  // Only "computer" side creatures.
  // TODO: Either `creatureId` or `reservedCreatureId` should be an undefined.
  reservedCreatureId: Creature['id'] | undefined,
  position: MatrixPosition,
}

export type BattleFieldMatrix = BattleFieldElement[][];

export type CreatureAppearance = {
  creatureIds: Creature['id'][],
  turnNumber: number,
}

export type CreatureWithParty = {
  creature: Creature,
  party: Party,
}

export type CreatureWithPartyOnBattleFieldElement = {
  creature: Creature,
  party: Party,
  battleFieldElement: BattleFieldElement,
}

type Cursor = {
  globalPosition: GlobalPosition,
}

export type VictoryOrDefeatId = 'victory' | 'defeat' | 'pending'

export type BattleResult = {
  victoryOrDefeatId: VictoryOrDefeatId,
}

export type Game = {
  battleFieldMatrix: BattleFieldMatrix,
  battleResult: BattleResult,
  cardsInDeck: CardRelationship[],
  cardsOnPlayersHand: CardRelationship[],
  cards: Card[],
  completedNormalAttackPhase: boolean,
  creatureAppearances: CreatureAppearance[],
  creatures: Creature[],
  cursor: Cursor | undefined,
  headquartersLifePoints: number,
  jobs: Job[],
  parties: Party[],
  turnNumber: number,
}

export type BattlePage = {
  game: Game,
}

export type ApplicationState = {
  pages: {
    battle?: BattlePage,
  },
}

export const MAX_NUMBER_OF_PLAYERS_HAND = 5

/**
 * Shuffle an array with the Fisher–Yates algorithm.
 * Ref) https://www.30secondsofcode.org/js/s/shuffle/
 */
export function shuffleArray<Element>(array: Element[], random: () => number): Element[] {
  const copied = array.slice()
  let m = copied.length
  while (m) {
    const i = Math.floor(random() * m)
    m--
    [copied[m], copied[i]] = [copied[i], copied[m]]
  }
  return copied
}

export function choiceElementsAtRandom<Element>(elements: Element[], numberOfChoices: number): Element[] {
  if (elements.length < numberOfChoices) {
    throw new Error('The number of elements in the array is not enough.')
  }
  const shuffled = shuffleArray(elements, Math.random)
  return shuffled.slice(0, numberOfChoices)
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
  )
}

export function flattenMatrix<Element>(matrix: Element[][]): Element[] {
  const flattened: Element[] = []

  matrix.forEach(row => {
    row.forEach(element => {
      flattened.push(element)
    })
  })
  return flattened
}

export const ensureBattlePage = (state: ApplicationState): BattlePage => {
  const battlePage = state.pages.battle
  if (battlePage === undefined) {
    throw new Error('`state.pages.battle` does not exist.')
  }
  return battlePage
}

export function areGlobalPositionsEqual(a: GlobalPosition, b: GlobalPosition): boolean {
  if (isBattleFieldMatrixPositionType(a) && isBattleFieldMatrixPositionType(b)) {
    return a.y === b.y && a.x === b.x
  } else if (isCardsOnPlayersHandPositionType(a) && isCardsOnPlayersHandPositionType(b)) {
    return a.creatureId === b.creatureId
  }
  return false
}

export function determineRelationshipBetweenFactions(a: FactionId, b: FactionId): FactionRelationshipId {
  return a === b ? 'ally' : 'enemy'
}

export function findJobById(jobs: Job[], jobId: Job['id']): Job {
  const found = jobs.find(job => job.id === jobId)
  if (!found) {
    throw new Error('Can not find the job.')
  }
  return found
}

export function findCreatureByIdIfPossible(creatures: Creature[], creatureId: Creature['id']): Creature | undefined {
  return creatures.find(creature => creature.id === creatureId)
}

export function findCreatureById(creatures: Creature[], creatureId: Creature['id']): Creature {
  const found = findCreatureByIdIfPossible(creatures, creatureId)
  if (!found) {
    throw new Error('Can not find the creature.')
  }
  return found
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

export function findPartyByCreatureId(parties: Party[], creatureId: Creature['id']): Party {
  for (const party of parties) {
    if (party.creatureIds.indexOf(creatureId) !== -1) {
      return party
    }
  }
  throw new Error('Can not find the `creatureId` in parties.')
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
        reservedCreatureId: undefined,
      })
    }
    battleFieldMatrix.push(row)
  }
  return battleFieldMatrix
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

export function findCardsByCreatureIds(cards: Card[], creatureIds: Creature['id'][]): Card[] {
  return creatureIds.map(creatureId => findCardByCreatureId(cards, creatureId))
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
  battleFieldMatrix: BattleFieldMatrix,
  exists: boolean = true
): BattleFieldElement[] {
  const elements = []
  for (const row of battleFieldMatrix) {
    for (const element of row) {
      if (
        exists && element.creatureId !== undefined ||
        !exists && element.creatureId === undefined
      ) {
        elements.push(element)
      }
    }
  }
  return elements
}

export function findCreatureAppearanceByTurnNumber(
  creatureAppearances: CreatureAppearance[],
  turnNumber: Game['turnNumber']
): CreatureAppearance | undefined {
  for (const creatureAppearance of creatureAppearances) {
    if (creatureAppearance.turnNumber === turnNumber) {
      return creatureAppearance
    }
  }
  return undefined
}

export function findCardUnderCursor(cards: Card[], cursor: Cursor): Card | undefined {
  for (const card of cards) {
    const position: GlobalPosition = {
      globalPlacementId: 'cardsOnPlayersHand',
      creatureId: card.creatureId,
    }
    if (areGlobalPositionsEqual(position, cursor.globalPosition)) {
      return card
    }
  }
  return undefined
}
