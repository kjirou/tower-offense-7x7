import {
  Creature,
  NormalAttackContext,
  findCreatureByIdOrError,
} from './utils';

function findCreatureWithParty(creatures: Creature[], parties: Party, creatureId: Creature['id']): {
  creature: Creature,
  party: Party,
} {
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

//function isCreatureEnemy() {
//}

export function invokeNormalAttack(context: NormalAttackContext): NormalAttackContext {
  const attackerWithParty = findCreatureWithParty(context.creatures, context.parties, context.attackerCreatureId)
  // TODO: 異なる派閥で射程範囲内のクリーチャーを抽出
  // TODO: ターゲット可能数の算出
  // TODO: 優先順位を考慮したターゲットの決定
  // TODO: ダメージ計算とコンテキストへの反映
  return context
}
