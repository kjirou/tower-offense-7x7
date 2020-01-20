import {
  BattleFieldElement,
  Creature,
  Party,
  NormalAttackContext,
  determineRelationshipBetweenFactions,
  findCreatureByIdOrError,
  findBattleFieldElementByCreatureId,
  findBattleFieldElementsByDistance,
} from './utils';

type CreatureWithParty = {
  creature: Creature,
  party: Party,
}

type CreatureWithPartyOnBattleFieldElement = {
  creature: Creature,
  party: Party,
  battleFieldElement: BattleFieldElement,
}

function findCreatureWithParty(
  creatures: Creature[],
  parties: Party[],
  creatureId: Creature['id']
): CreatureWithParty {
  for (let partyIndex = 0; partyIndex < parties.length; partyIndex++) {
    const party = parties[partyIndex]
    for (let creatureIdIndex = 0; creatureIdIndex < party.creatureIds.length; creatureIdIndex++) {
      const creatureIdInLoop = party.creatureIds[creatureIdIndex]
      if (creatureId === creatureIdInLoop) {
        const creature = findCreatureByIdOrError(creatures, creatureIdInLoop)
        return {
          creature,
          party,
        }
      }
    }
  }
  throw new Error('Can not find the `creatureId` from `parties`.')
}

export function invokeNormalAttack(context: NormalAttackContext): NormalAttackContext {
  const attackerWithParty = findCreatureWithParty(context.creatures, context.parties, context.attackerCreatureId)

  // 攻撃者情報を抽出する。
  const attackerData: CreatureWithPartyOnBattleFieldElement = {
    creature: attackerWithParty.creature,
    party: attackerWithParty.party,
    battleFieldElement: findBattleFieldElementByCreatureId(context.battleFieldMatrix, context.attackerCreatureId),
  }

  // 攻撃対象者候補である、射程範囲内で敵対関係のクリーチャー情報を抽出する。
  const targetCandidatesData: CreatureWithPartyOnBattleFieldElement[] = []
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
        targetCandidatesData.push({
          creature: creatureWithParty.creature,
          party: creatureWithParty.party,
          battleFieldElement: reachableBattleFieldElement,
        })
      }
    }
  }

  // TODO: ターゲット可能数の算出
  // TODO: 優先順位を考慮したターゲットの決定
  // TODO: ダメージ計算とコンテキストへの反映
  return context
}
