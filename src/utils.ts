/*
 * This file MUST NOT depend on any file in the project.
 */

export type MatrixPosition = {
  x: number,
  y: number,
}

export type MatrixPositionDelta = {
  x: number,
  y: number,
}

export type RangeShapeFragment = {
  reach: number,
  positionDeltas: MatrixPositionDelta[],
}

export type FactionId = 'player' | 'computer'

export type FactionRelationshipId = 'ally' | 'enemy'

export type SkillCategoryId = 'attack' | 'defense' | 'support'

export type Job = {
  attackPower: number,
  autoAttackRange: {
    maxReach: number,
    minReach: number,
    rangeShapeKey: string,
  },
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
  _attackPowerForTest?: Job['attackPower'],
  _autoAttackRangeForTest?: Job['autoAttackRange'],
  _maxLifePointsForTest?: Job['maxLifePoints'],
  _raidIntervalForTest?: Job['raidInterval'],
  _raidPowerForTest?: Job['raidPower'],
  autoAttackInvoked: boolean,
  id: string,
  jobId: string,
  lifePoints: number,
  raidCharge: number,
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
  actionPoints: number,
  actionPointsRecovery: number,
  battleFieldMatrix: BattleFieldMatrix,
  battleResult: BattleResult,
  cardsInDeck: CardRelationship[],
  cardsOnPlayersHand: CardRelationship[],
  cards: Card[],
  completedAutoAttackPhase: boolean,
  constants: {
    jobs: Job[],
  },
  creatureAppearances: CreatureAppearance[],
  creatures: Creature[],
  cursor: Cursor | undefined,
  headquartersLifePoints: number,
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

export const ACTION_POINTS_REQUIRED_FOR_CREATURE_PLACEMENT = 2

export const ACTION_POINTS_REQUIRED_FOR_SKILL_USE = 1

/**
 * リーチに対しての円形の範囲を生成する。
 *
 * 例えば、reach=2 なら、以下の "o" で表現している相対位置のリストを返す。
 * +-+-+-+-+-+
 * | | |o| | |
 * +-+-+-+-+-+
 * | |o| |o| |
 * +-+-+-+-+-+
 * |o| |@| |o| @={y:0, x:0}
 * +-+-+-+-+-+
 * | |o| |o| |
 * +-+-+-+-+-+
 * | | |o| | |
 * +-+-+-+-+-+
 *
 * reach=3 なら、以下の相対位置のリストを返す。
 * +-+-+-+-+-+-+-+
 * | | | |o| | | |
 * +-+-+-+-+-+-+-+
 * | | |o| |o| | |
 * +-+-+-+-+-+-+-+
 * | |o| | | |o| |
 * +-+-+-+-+-+-+-+
 * |o| | |@| | |o| @={y:0, x:0}
 * +-+-+-+-+-+-+-+
 * | |o| | | |o| |
 * +-+-+-+-+-+-+-+
 * | | |o| |o| | |
 * +-+-+-+-+-+-+-+
 * | | | |o| | | |
 * +-+-+-+-+-+-+-+
 */
export function createCircularRangeForReach(reach: number): MatrixPositionDelta[] {
  if (reach === 0) {
    return [{y: 0, x: 0}]
  }
  // 例えば、reach=3 なら [[3, 0], [2, 1], [1, 2]] というリストを期待している。
  // [0, 3] を含めない理由は、このリストを後続処理で 4 方向で掛けて処理するときに、
  //   [0, 3] は別の方向の [3, 0] と重なるためである。
  const combinationsWhoseTotalEqualsReach: [number, number][] = []
  for (let i = 0; i < reach; i++) {
    combinationsWhoseTotalEqualsReach.push([reach - i, i])
  }
  const positionDeltas: MatrixPositionDelta[] = []
  for (const directionKey of ['top', 'right', 'bottom', 'left']) {
    combinationsWhoseTotalEqualsReach.forEach(combination => {
      switch (directionKey) {
        case 'top':
          positionDeltas.push({
            y: combination[0] * 1,
            x: combination[1] * 1,
          })
          break
        case 'right':
          positionDeltas.push({
            y: combination[1] * -1 || 0,  // `-0` to `0`
            x: combination[0] * 1,
          })
          break
        case 'bottom':
          positionDeltas.push({
            y: combination[0] * -1 || 0,
            x: combination[1] * -1 || 0,
          })
          break
        case 'left':
          positionDeltas.push({
            y: combination[1] * 1,
            x: combination[0] * -1 || 0,
          })
          break
        default:
          throw Error('This direction does not exist.')
          break
      }
    })
  }
  return positionDeltas
}

export const RANGE_SHAPES: {[key: string]: RangeShapeFragment[]} = {
  circle: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(reach => {
    return {
      reach,
      positionDeltas: createCircularRangeForReach(reach),
    }
  }),
  cross: [
    {
      reach: 0,
      positionDeltas: [{y: 0, x: 0}],
    },
    ...(
      [1, 2, 3, 4, 5, 6].map(reach => {
        return {
          reach,
          positionDeltas: [
            {y: reach, x: 0},
            {y: 0, x: reach},
            {y: -reach, x: 0},
            {y: 0, x: -reach},
          ],
        }
      })
    ),
  ],
  onlyMyself: [
    {
      reach: 0,
      positionDeltas: [{y: 0, x: 0}],
    },
  ],
}

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

/**
 * 指定範囲のマスリストを返す。
 *
 * マスの整列順は、1) reach の短い範囲から、2) おおよそ top -> right -> bottom -> left の方向の順、を想定している。
 * 例えば、circle なら以下の順番になる。
 * +-+-+-+-+-+
 * | | |5| | |
 * +-+-+-+-+-+
 * | |c|1|6| |
 * +-+-+-+-+-+
 * |b|4|@|2|7|
 * +-+-+-+-+-+
 * | |a|3|8| |
 * +-+-+-+-+-+
 * | | |9| | |
 * +-+-+-+-+-+
 * ただし、2 の方向については、RANGE_SHAPES の手動で設定している順番に依存しているため、
 *   その設定順が間違えるとずれる。
 */
export function findBattleFieldElementsByRange(
  matrix: BattleFieldMatrix,
  startPoint: MatrixPosition,
  rangeShapeKey: string,
  minReach: number,
  maxReach: number,
  rangeShapes: typeof RANGE_SHAPES = RANGE_SHAPES,
): BattleFieldElement[] {
  const rangeShape = rangeShapes[rangeShapeKey]
  if (rangeShape === undefined) {
    throw new Error('There is no range corresponding to this `rangeKey`.')
  }
  const rangeFragments = rangeShape.filter(rangeFragment => {
    return rangeFragment.reach >= minReach && rangeFragment.reach <= maxReach
  })
  let compositePositionDeltas: {y: number, x: number}[] = []
  for (const rangeFragment of rangeFragments) {
    compositePositionDeltas = compositePositionDeltas.concat(rangeFragment.positionDeltas)
  }
  return compositePositionDeltas
    .map(positionDelta => {
      return {
        y: startPoint.y + positionDelta.y,
        x: startPoint.x + positionDelta.x,
      }
    })
    .filter(({y, x}) => y >= 0 && y <= matrix.length - 1 && x >= 0 && x <= matrix[0].length - 1)
    .map(({y, x}) => matrix[y][x])
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

export const creatureUtils = {
  getAttackPower: (creature: Creature, constants: Game['constants']): number => {
    if (creature._attackPowerForTest !== undefined) {
      return creature._attackPowerForTest
    }
    const job = findJobById(constants.jobs, creature.jobId)
    return job.attackPower
  },
  getAutoAttackRange: (creature: Creature, constants: Game['constants']): Job['autoAttackRange'] => {
    if (creature._autoAttackRangeForTest !== undefined) {
      return creature._autoAttackRangeForTest
    }
    const job = findJobById(constants.jobs, creature.jobId)
    return job.autoAttackRange
  },
  getMaxLifePoints: (creature: Creature, constants: Game['constants']): number => {
    if (creature._maxLifePointsForTest !== undefined) {
      return creature._maxLifePointsForTest
    }
    const job = findJobById(constants.jobs, creature.jobId)
    return job.maxLifePoints
  },
  getTurnsUntilRaid: (creature: Creature, constants: Game['constants']): number => {
    const job = findJobById(constants.jobs, creature.jobId)
    const interval = creatureUtils.getRaidInterval(creature, constants)
    return interval - creature.raidCharge
  },
  getRaidInterval: (creature: Creature, constants: Game['constants']): number => {
    if (creature._raidIntervalForTest !== undefined) {
      return creature._raidIntervalForTest
    }
    const job = findJobById(constants.jobs, creature.jobId)
    return job.raidInterval
  },
  getRaidPower: (creature: Creature, constants: Game['constants']): number => {
    if (creature._raidPowerForTest !== undefined) {
      return creature._raidPowerForTest
    }
    const job = findJobById(constants.jobs, creature.jobId)
    return job.raidPower
  },
  isDead: (creature: Creature): boolean => creature.lifePoints === 0,
  canAct: (creature: Creature): boolean => !creatureUtils.isDead(creature),
  isRaidChageFull: (creature: Creature, constants: Game['constants']): boolean => {
    return creatureUtils.getRaidInterval(creature, constants) === creature.raidCharge
  },
  alterLifePoints: (creature: Creature, constants: Game['constants'], delta: number): Creature => {
    const maxLifePoints = creatureUtils.getMaxLifePoints(creature, constants)
    return {
      ...creature,
      lifePoints: Math.min(Math.max(creature.lifePoints + delta, 0), maxLifePoints),
    }
  },
  alterRaidCharge: (creature: Creature, constants: Game['constants'], delta: number): Creature => {
    const interval = creatureUtils.getRaidInterval(creature, constants)
    return {
      ...creature,
      raidCharge: Math.min(Math.max(creature.raidCharge + delta, 0), interval),
    }
  },
  updateRaidChargeWithTurnProgress: (creature: Creature, constants: Game['constants']): Creature => {
    const delta = creatureUtils.isRaidChageFull(creature, constants) ? -creature.raidCharge : 1
    return creatureUtils.alterRaidCharge(creature, constants, delta)
  },
}

export const gameParameterUtils = {
  getActionPointsRecovery: (game: Game): number => {
    return game.actionPointsRecovery
  },
  alterActionPoints: (game: Game, delta: number): Game => {
    return {
      ...game,
      actionPoints: Math.min(Math.max(game.actionPoints + delta, 0), 99),
    }
  },
}
