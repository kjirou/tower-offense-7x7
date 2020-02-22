import {
  BattleFieldElement,
  BattleFieldMatrix,
  CardRelationship,
  Creature,
  CreatureAppearance,
  CreatureWithParty,
  CreatureWithPartyOnBattleFieldElement,
  Game,
  MAX_NUMBER_OF_PLAYERS_HAND,
  MatrixPosition,
  NormalAttackProcessContext,
  Party,
  SkillProcessContext,
  choiceElementsAtRandom,
  determineRelationshipBetweenFactions,
  findCreatureAppearanceByTurnNumber,
  findCreatureById,
  findCreatureByIdIfPossible,
  findBattleFieldElementByCreatureId,
  findBattleFieldElementsByDistance,
  findCreatureWithParty,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils';

export const creatureUtils = {
  canAct: (creature: Creature): boolean => !creatureUtils.isDead(creature),
  isDead: (creature: Creature): boolean => creature.lifePoint === 0,
}

export function invokeNormalAttack(context: NormalAttackProcessContext): NormalAttackProcessContext {
  const attackerWithParty = findCreatureWithParty(context.creatures, context.parties, context.attackerCreatureId)

  // 攻撃者情報を抽出する。
  const attackerData: CreatureWithPartyOnBattleFieldElement = {
    creature: attackerWithParty.creature,
    party: attackerWithParty.party,
    battleFieldElement: findBattleFieldElementByCreatureId(context.battleFieldMatrix, context.attackerCreatureId),
  }

  // 攻撃対象者候補である、射程範囲内で敵対関係のクリーチャー情報を抽出する。
  const targeteeCandidatesData: CreatureWithPartyOnBattleFieldElement[] = []
  const dummyDistance = 1
  const reachableBattleFieldElements = findBattleFieldElementsByDistance(
    context.battleFieldMatrix, attackerData.battleFieldElement.position, dummyDistance)
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
  //       通常攻撃の副作用で攻撃者に有利な効果が発生することもあり、それが意図せずに発生しないと損な感じが強そう。
  //       それにより、死亡しているクリーチャーも攻撃対象に含まれることになる。
  const affectedCreatures: Creature[] = targeteesData
    .map(targeteeData => {
      const dummyDamage = 1
      const newLifePoint = Math.max(targeteeData.creature.lifePoint - dummyDamage, 0)
      return Object.assign({}, targeteeData.creature, {
        lifePoint: newLifePoint,
      })
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

function invokeAttackSkill(context: SkillProcessContext): SkillProcessContext {
  const invokerWithParty = findCreatureWithParty(context.creatures, context.parties, context.invokerCreatureId)

  // 発動者情報をまとめる。
  const attackerData: CreatureWithPartyOnBattleFieldElement = {
    creature: invokerWithParty.creature,
    party: invokerWithParty.party,
    battleFieldElement: findBattleFieldElementByCreatureId(context.battleFieldMatrix, context.invokerCreatureId),
  }

  // 作用対象者候補である、射程範囲内で敵対関係のクリーチャー情報を探す。
  const targeteeCandidatesData: CreatureWithPartyOnBattleFieldElement[] = []
  const dummyDistance = 2
  const reachableBattleFieldElements = findBattleFieldElementsByDistance(
    context.battleFieldMatrix, attackerData.battleFieldElement.position, dummyDistance)
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
      const newLifePoint = Math.max(targeteeData.creature.lifePoint - dummyDamage, 0)
      return Object.assign({}, targeteeData.creature, {
        lifePoint: newLifePoint,
      })
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

export function invokeSkill(context: SkillProcessContext): SkillProcessContext {
  if (context.skill.skillCategoryId === 'attack') {
    return invokeAttackSkill(context)
  }
  throw new Error('It is an invalid `skillCategoryId`.')
}

export function determinePositionsOfCreatureAppearance(
  battleFieldMatrix: BattleFieldMatrix,
  creatureAppearances: CreatureAppearance[],
  turnNumber: Game['turnNumber']
): {
  creatureId: Creature['id'],
  position: MatrixPosition,
}[] {
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
    return choiceElementsAtRandom<BattleFieldElement>(elements, creatureAppearance.creatureIds.length)
      .map((choicedElement, index) => {
        return {
          creatureId: creatureAppearance.creatureIds[index],
          position: choicedElement.position,
        }
      })
  }
  return []
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
