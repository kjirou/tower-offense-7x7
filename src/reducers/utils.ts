/**
 * This file can be referenced only from the "reducers/index" or tests.
 */
import {
  BattleFieldElement,
  BattleFieldMatrix,
  CardRelationship,
  Creature,
  CreatureAppearance,
  CreatureWithParty,
  CreatureWithPartyOnBattleFieldElement,
  Game,
  Job,
  MAX_NUMBER_OF_PLAYERS_HAND,
  MatrixPosition,
  Party,
  Skill,
  VictoryOrDefeatId,
  choiceElementsAtRandom,
  creatureUtils,
  determineRelationshipBetweenFactions,
  findBattleFieldElementByCreatureId,
  findBattleFieldElementsByRange,
  findCreatureAppearanceByTurnNumber,
  findCreatureById,
  findCreatureByIdIfPossible,
  findCreatureWithParty,
  findJobById,
  findPartyByCreatureId,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils';

type SkillProcessContext = {
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
  constants: Game['constants'],
  invokerCreatureId: Creature['id'],
  parties: Party[],
  skill: Skill,
}

type SkillProcessResult = {
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
}

export function doesPlayerHaveVictory(
  parties: Party[],
  battleFieldMatrix: BattleFieldMatrix,
  creatureAppearances: CreatureAppearance[],
  currentTurnNumber: Game['turnNumber']
): boolean {
  return (
    creatureAppearances.filter(e => e.turnNumber > currentTurnNumber).length === 0 &&
    battleFieldMatrix.every(row => {
      return row.every(element => {
        return (
          element.reservedCreatureId === undefined &&
          (
            element.creatureId === undefined ||
            findPartyByCreatureId(parties, element.creatureId).factionId === 'player'
          )
        )
      })
    })
  )
}

export function doesPlayerHaveDefeat(headquartersLifePoints: Game['headquartersLifePoints']): boolean {
  return headquartersLifePoints === 0
}

export function determineVictoryOrDefeat(
  parties: Party[],
  battleFieldMatrix: BattleFieldMatrix,
  creatureAppearances: CreatureAppearance[],
  currentTurnNumber: Game['turnNumber'],
  headquartersLifePoints: Game['headquartersLifePoints']
): VictoryOrDefeatId {
  return doesPlayerHaveVictory(parties, battleFieldMatrix, creatureAppearances, currentTurnNumber)
    ? 'victory'
    : doesPlayerHaveDefeat(headquartersLifePoints)
      ? 'defeat'
      : 'pending'
}

export function placePlayerFactionCreature(
  battleFieldMatrix: BattleFieldMatrix,
  cardsOnPlayersHand: CardRelationship[],
  creatureId: Creature['id'],
  position: MatrixPosition
): {
  battleFieldMatrix: BattleFieldMatrix,
  cardsOnPlayersHand: CardRelationship[],
} {
  const element = battleFieldMatrix[position.y][position.x]
  // NOTE: 欲しい仕様ではないが、今はこの状況にならないはず。
  if (element.creatureId !== undefined) {
    throw new Error('A creature exist in the battle field element.')
  }

  let newBattleFieldMatrix = battleFieldMatrix.slice()
  newBattleFieldMatrix[position.y] = newBattleFieldMatrix[position.y].slice()
  newBattleFieldMatrix[position.y][position.x] = {
    ...newBattleFieldMatrix[position.y][position.x],
    creatureId,
  }
  const newCardsOnPlayersHand = cardsOnPlayersHand.filter(e => e.creatureId !== creatureId)
  if (newCardsOnPlayersHand.length === cardsOnPlayersHand.length) {
    throw new Error('The `creatureId` does not exist on the player\'s hand.')
  }

  return {
    battleFieldMatrix: newBattleFieldMatrix,
    cardsOnPlayersHand: newCardsOnPlayersHand,
  }
}

export function removeDeadCreatures(
  creatures: Creature[],
  parties: Party[],
  battleFieldMatrix: BattleFieldMatrix,
  cardsInDeck: CardRelationship[]
): {
  battleFieldMatrix: BattleFieldMatrix,
  cardsInDeck: CardRelationship[],
} {
  // 死亡しているクリーチャーが存在する位置をまとめる。
  const positionsOfDeadCreature: MatrixPosition[] = []
  for (const element of pickBattleFieldElementsWhereCreatureExists(battleFieldMatrix)) {
    if (element.creatureId !== undefined) {
      const creature = findCreatureById(creatures, element.creatureId)
      if (creatureUtils.isDead(creature)) {
        positionsOfDeadCreature.push(element.position)
      }
    }
  }

  let battleFieldMatrixBeingUpdated = battleFieldMatrix.slice().map(row => row.slice())
  let cardsInDeckBeingUpdated = cardsInDeck.slice()

  positionsOfDeadCreature.forEach(position => {
    const creatureId = battleFieldMatrixBeingUpdated[position.y][position.x].creatureId
    if (creatureId !== undefined) {
      // 盤上のクリーチャーを削除する。
      battleFieldMatrixBeingUpdated[position.y][position.x] = {
        ...battleFieldMatrixBeingUpdated[position.y][position.x],
        creatureId: undefined,
      }
      // プレイヤーのクリーチャーのときは、山札の末尾へ戻す。
      const {party} = findCreatureWithParty(creatures, parties, creatureId)
      if (party.factionId === 'player') {
        cardsInDeckBeingUpdated.push({
          creatureId,
        })
      }
    }
  })

  return {
    battleFieldMatrix: battleFieldMatrixBeingUpdated,
    cardsInDeck: cardsInDeckBeingUpdated,
  }
}

export function invokeAutoAttack(
  constants: Game['constants'],
  creatures: Creature[],
  parties: Party[],
  battleFieldMatrix: BattleFieldMatrix,
  attackerCreatureId: Creature['id'],
): {
  creatures: Creature[],
} {
  const {jobs} = constants
  const attackerWithParty = findCreatureWithParty(creatures, parties, attackerCreatureId)

  // 攻撃者情報を抽出する。
  const attackerData: CreatureWithPartyOnBattleFieldElement = {
    creature: attackerWithParty.creature,
    party: attackerWithParty.party,
    battleFieldElement: findBattleFieldElementByCreatureId(battleFieldMatrix, attackerCreatureId),
  }

  if (attackerData.creature.autoAttackInvoked) {
    throw new Error('The creature had already invoked a auto-attack.')
  }

  // 攻撃対象者候補である、範囲内で敵対関係のクリーチャー情報を抽出する。
  const targeteeCandidatesData: CreatureWithPartyOnBattleFieldElement[] = []
  const range = creatureUtils.getAutoAttackRange(attackerData.creature, constants)
  const reachableBattleFieldElements = findBattleFieldElementsByRange(
    battleFieldMatrix,
    attackerData.battleFieldElement.position,
    range.rangeShapeKey,
    range.minReach,
    range.maxReach
  )
  for (const reachableBattleFieldElement of reachableBattleFieldElements) {
    if (reachableBattleFieldElement.creatureId !== undefined) {
      const creatureWithParty =
        findCreatureWithParty(creatures, parties, reachableBattleFieldElement.creatureId)
      if (
        determineRelationshipBetweenFactions(
          creatureWithParty.party.factionId, attackerData.party.factionId
        ) === 'enemy'
      ) {
        targeteeCandidatesData.push({
          creature: creatureWithParty.creature,
          party: creatureWithParty.party,
          battleFieldElement: reachableBattleFieldElement,
        })
      }
    }
  }

  let newCreatures = creatures.slice()

  // 範囲内に攻撃対象がいたとき。
  if (targeteeCandidatesData.length > 0) {
    // 最大攻撃対象数を算出する。
    const dummyMaxNumberOfTargetees = 1

    // 優先順位を考慮して攻撃対象を決定する。
    const targeteesData = targeteeCandidatesData
      .slice()
      // TODO: Priority calculation
      .sort((a, b) => {
        return -1
      })
      .slice(0, dummyMaxNumberOfTargetees)

    // 影響を決定する。
    // NOTE: このループ内で攻撃対象が死亡するなどしても、対象から除外しなくても良い。
    //       自動攻撃の副作用で攻撃者に有利な効果が発生することもあり、それが意図せずに発生しないと損な感じが強そう。
    //       それにより、死亡しているクリーチャーも攻撃対象に含まれることになる。
    const affectedCreatures: Creature[] = targeteesData
      .map(targeteeData => {
        const damage = creatureUtils.getAttackPower(attackerData.creature, constants)
        return creatureUtils.alterLifePoints(targeteeData.creature, constants, -damage)
      })

    // 攻撃対象へ影響を反映する。
    newCreatures = newCreatures.map(creature => {
      const affected = findCreatureByIdIfPossible(affectedCreatures, creature.id)
      return affected || creature
    })

    // 自動攻撃攻撃者の自動攻撃実行済みフラグを true にする。
    newCreatures = newCreatures.map(creature => {
      if (creature.id === attackerData.creature.id) {
        creature.autoAttackInvoked = true
      }
      return creature
    })
  }

  return {
    creatures: newCreatures,
  }
}

export function invokeRaid(
  constants: Game['constants'],
  creatures: Creature[],
  raiderCreatureId: Creature['id'],
  headquartersLifePoints: Game['headquartersLifePoints'],
): {
  headquartersLifePoints: Game['headquartersLifePoints'],
} {
  const raider = findCreatureById(creatures, raiderCreatureId)
  return {
    headquartersLifePoints: Math.max(headquartersLifePoints - creatureUtils.getRaidPower(raider, constants), 0),
  }
}

function invokeAttackSkill(context: SkillProcessContext): SkillProcessResult {
  const invokerWithParty = findCreatureWithParty(context.creatures, context.parties, context.invokerCreatureId)

  // 発動者情報をまとめる。
  const attackerData: CreatureWithPartyOnBattleFieldElement = {
    creature: invokerWithParty.creature,
    party: invokerWithParty.party,
    battleFieldElement: findBattleFieldElementByCreatureId(context.battleFieldMatrix, context.invokerCreatureId),
  }

  // 作用対象者候補である、射程範囲内で敵対関係のクリーチャー情報を探す。
  const targeteeCandidatesData: CreatureWithPartyOnBattleFieldElement[] = []
  const dummyReach = 2
  const reachableBattleFieldElements = findBattleFieldElementsByRange(
    context.battleFieldMatrix, attackerData.battleFieldElement.position, 'circle', 0, dummyReach)
  for (const reachableBattleFieldElement of reachableBattleFieldElements) {
    if (reachableBattleFieldElement.creatureId !== undefined) {
      const creatureWithParty =
        findCreatureWithParty(context.creatures, context.parties, reachableBattleFieldElement.creatureId)
      if (
        determineRelationshipBetweenFactions(
          creatureWithParty.party.factionId, attackerData.party.factionId
        ) === 'enemy'
      ) {
        targeteeCandidatesData.push({
          creature: creatureWithParty.creature,
          party: creatureWithParty.party,
          battleFieldElement: reachableBattleFieldElement,
        })
      }
    }
  }

  // 最大攻撃対象数を算出する。
  const dummyMaxNumberOfTargetees = 99

  // 優先順位を考慮して作用対象を決定する。
  const targeteesData = targeteeCandidatesData
    .slice()
    // TODO: Priority calculation
    .sort((a, b) => {
      return -1
    })
    .slice(0, dummyMaxNumberOfTargetees)

  // 影響を決定する。
  const affectedCreatures: Creature[] = targeteesData
    .map(targeteeData => {
      const dummyDamage = 3
      return creatureUtils.alterLifePoints(targeteeData.creature, context.constants, -dummyDamage)
    })

  // コンテキストへ反映する。
  const newCreatures = context.creatures
    .map(creature => {
      const affected = findCreatureByIdIfPossible(affectedCreatures, creature.id)
      return affected || creature
    })
  const newContext = Object.assign({}, context, {
    creatures: newCreatures,
  })

  return newContext
}

export function invokeSkill(context: SkillProcessContext): SkillProcessResult {
  if (context.skill.skillCategoryId === 'attack') {
    return invokeAttackSkill(context)
  }
  throw new Error('It is an invalid `skillCategoryId`.')
}

export function increaseRaidChargeForEachComputerCreatures(
  constants: Game['constants'],
  creatures: Creature[],
  parties: Party[],
  battleFieldMatrix: BattleFieldMatrix,
): {
  creatures: Creature[],
} {
  const affectedCreatures: Creature[] = []
  for (const element of pickBattleFieldElementsWhereCreatureExists(battleFieldMatrix)) {
    if (element.creatureId !== undefined) {
      const creatureWithParty = findCreatureWithParty(creatures, parties, element.creatureId)
      if (
        creatureWithParty.party.factionId === 'computer' &&
        creatureWithParty.creature.autoAttackInvoked === false
      ) {
        affectedCreatures.push(creatureUtils.updateRaidChargeWithTurnProgress(creatureWithParty.creature, constants))
      }
    }
  }

  const newCreatures = creatures.map(creature => {
    return findCreatureByIdIfPossible(affectedCreatures, creature.id) || creature
  })

  return {
    creatures: newCreatures,
  }
}

export function reserveCreatures(
  battleFieldMatrix: BattleFieldMatrix,
  creatureAppearances: CreatureAppearance[],
  turnNumber: Game['turnNumber'],
  choiceElements: (elements: BattleFieldElement[], numberOfElements: number) => BattleFieldElement[]
): {
  battleFieldMatrix: BattleFieldMatrix,
} {
  const newBattleFieldMatrix = battleFieldMatrix.slice().map(row => row.slice())

  // 指定ターン数のクリーチャー出現情報を抽出する。
  const creatureAppearance = findCreatureAppearanceByTurnNumber(creatureAppearances, turnNumber)

  // クリーチャーが出現するターン数のとき。
  if (creatureAppearance) {
    const elements = pickBattleFieldElementsWhereCreatureExists(battleFieldMatrix, false)
      .filter(e => e.reservedCreatureId === undefined)

    // TODO: 勝敗判定に含めるなどして、この状況が発生しないようにする。
    if (elements.length < creatureAppearance.creatureIds.length) {
      throw new Error('There are no battle field elements for creature appearances.')
    }

    // 出現ルールに従って、予約される位置リストを生成する。
    const reservedCreaturePositions = choiceElements(elements, creatureAppearance.creatureIds.length)
      .map((choicedElement, index) => {
        return {
          creatureId: creatureAppearance.creatureIds[index],
          position: choicedElement.position,
        }
      })

    // 各マスへクリーチャー出現を予約する。
    reservedCreaturePositions.forEach(({position, creatureId}) => {
      newBattleFieldMatrix[position.y][position.x] = {
        ...newBattleFieldMatrix[position.y][position.x],
        reservedCreatureId: creatureId,
      }
    })
  }

  return {
    battleFieldMatrix: newBattleFieldMatrix,
  }
}

export function refillCardsOnPlayersHand(
  cardsInDeck: CardRelationship[],
  cardsOnPlayersHand:CardRelationship[]
): {
  cardsInDeck: CardRelationship[],
  cardsOnPlayersHand:CardRelationship[]
} {
  const delta = MAX_NUMBER_OF_PLAYERS_HAND - cardsOnPlayersHand.length
  if (delta < 0) {
    throw new Error('The player\'s hand exceeds the max number.')
  }
  return {
    cardsInDeck: cardsInDeck.slice(delta, cardsInDeck.length),
    cardsOnPlayersHand: cardsOnPlayersHand.concat(cardsInDeck.slice(0, delta)),
  }
}

export function initializeGame(game: Game): Game {
  let newGame = {...game}

  // クリーチャーの現在ライフポイントを最大まで回復させる。
  newGame = {
    ...newGame,
    creatures: game.creatures.map(creature => {
      return creatureUtils.alterLifePoints(
        creature, game.constants, creatureUtils.getMaxLifePoints(creature, game.constants))
    }),
  }

  // 1 ターン目のクリーチャーを予約する。
  newGame = {
    ...newGame,
    ...reserveCreatures(
      game.battleFieldMatrix,
      game.creatureAppearances,
      0,
      (elements: BattleFieldElement[], numberOfElements: number): BattleFieldElement[] => {
        return choiceElementsAtRandom<BattleFieldElement>(elements, numberOfElements)
      }
    ),
  }

  return newGame
}
