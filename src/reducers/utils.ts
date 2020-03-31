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
  DEFAULT_PLACEMENT_ORDER,
  MAX_NUMBER_OF_PLAYERS_HAND,
  MatrixPosition,
  Party,
  Skill,
  VictoryOrDefeatId,
  calculateRangeAndTargeteesOfAutoAttack,
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
        return element.creatureId === undefined ||
          findPartyByCreatureId(parties, element.creatureId).factionId === 'player'
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
  creatures: Creature[],
  battleFieldMatrix: BattleFieldMatrix,
  cardsOnPlayersHand: CardRelationship[],
  creatureId: Creature['id'],
  position: MatrixPosition
): {
  battleFieldMatrix: BattleFieldMatrix,
  cardsOnPlayersHand: CardRelationship[],
  creatures: Creature[],
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

  // 配置順を記録する。
  const maxPlacementOrder = Math.max(DEFAULT_PLACEMENT_ORDER, ...creatures.map(e => e.placementOrder))
  const newCreatures = creatures.map(creature => {
    if (creature.id === creatureId) {
      return {
        ...creature,
        placementOrder: maxPlacementOrder + 1,
      }
    }
    return creature
  })

  return {
    creatures: newCreatures,
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

/**
 * 自動攻撃の攻撃者リストを発動順で整列する。
 */
export function sortAutoAttackersOrder(
  attackers: CreatureWithPartyOnBattleFieldElement[],
): CreatureWithPartyOnBattleFieldElement[] {
  return attackers
    .slice()
    // 第 2 条件は、クリーチャーの配置順である。
    .sort((a, b) => {
      if (a.creature.placementOrder < b.creature.placementOrder) {
        return -1
      } else if (a.creature.placementOrder > b.creature.placementOrder) {
        return 1
      }
      return 0
    })
    // 第 1 条件は、player 側かどうかである。
    .sort((a, b) => {
      if (a.party.factionId === 'player' && b.party.factionId === 'computer') {
        return -1
      } else if (a.party.factionId === 'computer' && b.party.factionId === 'player') {
        return 1
      }
      return 0
    })
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
  // 攻撃者情報を抽出する。
  const attackerSet: CreatureWithPartyOnBattleFieldElement = {
    ...findCreatureWithParty(creatures, parties, attackerCreatureId),
    battleFieldElement: findBattleFieldElementByCreatureId(battleFieldMatrix, attackerCreatureId),
  }

  if (attackerSet.creature.autoAttackInvoked) {
    throw new Error('The creature had already invoked a auto-attack.')
  }

  const {targetees} = calculateRangeAndTargeteesOfAutoAttack(
    constants, creatures, parties, battleFieldMatrix, attackerCreatureId)

  let newCreatures = creatures.slice()

  if (targetees.length > 0) {
    // 影響を決定する。
    // NOTE: このループ内で攻撃対象が死亡するなどしても、対象から除外しなくても良い。
    //       自動攻撃の副作用で攻撃者に有利な効果が発生することもあり、それが意図せずに発生しないと損な感じが強そう。
    //       それにより、死亡しているクリーチャーも攻撃対象に含まれることになる。
    const affectedCreatures: Creature[] = targetees
      .map(targeteeSet => {
        const damage = creatureUtils.getAttackPower(attackerSet.creature, constants)
        return creatureUtils.alterLifePoints(targeteeSet.creature, constants, -damage)
      })

    // 攻撃対象へ影響を反映する。
    newCreatures = newCreatures.map(creature => {
      return findCreatureByIdIfPossible(affectedCreatures, creature.id) || creature
    })

    // 自動攻撃攻撃者の自動攻撃実行済みフラグを true にする。
    newCreatures = newCreatures.map(creature => {
      if (creature.id === attackerSet.creature.id) {
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

export function spawnCreatures(
  creatures: Creature[],
  battleFieldMatrix: BattleFieldMatrix,
  creatureAppearances: CreatureAppearance[],
  turnNumber: Game['turnNumber'],
  choiceElements: (elements: BattleFieldElement[], numberOfElements: number) => BattleFieldElement[]
): {
  battleFieldMatrix: BattleFieldMatrix,
  creatures: Creature[],
} {
  let newCreatures = creatures.slice()
  const newBattleFieldMatrix = battleFieldMatrix.slice().map(row => row.slice())

  // 指定ターン数のクリーチャー出現情報を抽出する。
  const creatureAppearance = findCreatureAppearanceByTurnNumber(creatureAppearances, turnNumber)

  // クリーチャーが出現するターン数のとき。
  if (creatureAppearance) {
    const elements = pickBattleFieldElementsWhereCreatureExists(battleFieldMatrix, false)

    // TODO: 勝敗判定に含めるなどして、この状況が発生しないようにする。
    if (elements.length < creatureAppearance.creatureIds.length) {
      throw new Error('There are no battle field elements for creature appearances.')
    }

    // 出現ルールに従って、出現位置リストを生成する。
    const creaturePositions = choiceElements(elements, creatureAppearance.creatureIds.length)
      .map((choicedElement, index) => {
        return {
          creatureId: creatureAppearance.creatureIds[index],
          position: choicedElement.position,
        }
      })

    // 各マスへクリーチャーを出現させる、そして、クリーチャーの配置順を更新する。
    let maxPlacementOrder = Math.max(DEFAULT_PLACEMENT_ORDER, ...newCreatures.map(e => e.placementOrder))
    creaturePositions.forEach(({position, creatureId}) => {
      newBattleFieldMatrix[position.y][position.x] = {
        ...newBattleFieldMatrix[position.y][position.x],
        creatureId: creatureId,
      }
      maxPlacementOrder++
      newCreatures = newCreatures.map(creature => {
        if (creatureId === creature.id) {
          return {
            ...creature,
            placementOrder: maxPlacementOrder,
          }
        }
        return creature
      })
    })
  }

  return {
    creatures: newCreatures,
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

  // 1 ターン目のクリーチャーを出現させる。
  newGame = {
    ...newGame,
    ...spawnCreatures(
      newGame.creatures,
      newGame.battleFieldMatrix,
      newGame.creatureAppearances,
      0,
      (elements: BattleFieldElement[], numberOfElements: number): BattleFieldElement[] => {
        return choiceElementsAtRandom<BattleFieldElement>(elements, numberOfElements)
      }
    ),
  }

  return newGame
}
