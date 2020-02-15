import produce from 'immer'

import {
  ApplicationState,
  BattleFieldElement,
  BattleFieldMatrix,
  BattlePage,
  Card,
  Creature,
  CreatureWithParty,
  CreatureWithPartyOnBattleFieldElement,
  GlobalPosition,
  MatrixPosition,
  NormalAttackContext,
  Party,
  areGlobalPositionsEqual,
  determineRelationshipBetweenFactions,
  ensureBattlePage,
  findCardUnderCursor,
  findCreatureWithParty,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils'
import {
  invokeNormalAttack,
} from './game'

export function selectBattleFieldElement(
  state: ApplicationState,
  y: MatrixPosition['y'],
  x: MatrixPosition['x']
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    const selectedPosition: GlobalPosition = {
      globalPlacementId: 'battleFieldMatrix',
      y,
      x,
    }

    // カーソルが当たっているマスを選択するとき。
    if (
      draft.game.cursor &&
      areGlobalPositionsEqual(selectedPosition, draft.game.cursor.globalPosition)
    ) {
      // カーソルが外れる。
      draft.game.cursor = undefined
    // カーソルが当たっていないマスを選択するとき。
    } else {
      // 選択先のマスの情報。
      const battleFieldElement: BattleFieldElement = draft.game.battleFieldMatrix[y][x]
      // 選択先のマスへクリーチャーが配置されているか。
      const placedCreatureWithParty: CreatureWithParty | undefined = battleFieldElement.creatureId !== undefined
        ? findCreatureWithParty(draft.game.creatures, draft.game.parties, battleFieldElement.creatureId)
        : undefined
      // 手札のカードへカーソルが当たっているか。
      const cardUnderCursor: Card | undefined = draft.game.cursor
        ? findCardUnderCursor(draft.game.cards, draft.game.cursor)
        : undefined

      // 手札のカードへカーソルが当たっているとき。
      if (cardUnderCursor) {
        // 選択先のマスへクリーチャーが配置されているとき。
        if (placedCreatureWithParty) {
          // 選択先クリーチャーが味方のとき。
          if (determineRelationshipBetweenFactions('player', placedCreatureWithParty.party.factionId) === 'ally') {
          // 選択先クリーチャーが敵のとき。
          } else {
            /* no-op */
          }
        // 選択先のマスへクリーチャーが配置されていないとき。
        } else {
          // クリーチャーを配置する。
          battleFieldElement.creatureId = cardUnderCursor.creatureId
          // 手札のカードを一枚減らす。
          draft.game.cardsOnYourHand = draft.game.cardsOnYourHand
            .filter(e => e.creatureId !== cardUnderCursor.creatureId)
          // カーソルを外す。
          draft.game.cursor = undefined
        }
      } else {
        draft.game.cursor = {
          globalPosition: {
            globalPlacementId: 'battleFieldMatrix',
            y,
            x,
          },
        }
      }
    }
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}

export function selectCardOnYourHand(
  state: ApplicationState,
  creatureId: Creature['id'],
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    const touchedPosition: GlobalPosition = {
      globalPlacementId: 'cardsOnYourHand',
      creatureId,
    }
    if (
      draft.game.cursor &&
      areGlobalPositionsEqual(touchedPosition, draft.game.cursor.globalPosition)
    ) {
      draft.game.cursor = undefined;
    } else {
      draft.game.cursor = {
        globalPosition: {
          globalPlacementId: 'cardsOnYourHand',
          creatureId,
        },
      }
    }
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}

export function proceedTurn(
  state: ApplicationState,
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    const game = draft.game

    // TODO: ターン数を増加する。
    // TODO: アニメーション用の情報を生成する。

    // 攻撃者リストを抽出する。
    const elementsWhereCreatureExists =
      pickBattleFieldElementsWhereCreatureExists(game.battleFieldMatrix)
    const attackerDataList: CreatureWithPartyOnBattleFieldElement[] = elementsWhereCreatureExists
      .map((battleFieldElement) => {
        // `pickBattleFieldElementsWhereCreatureExists` guarantees that each creature exists.
        const creatureId = battleFieldElement.creatureId as Creature['id']
        return Object.assign(
          findCreatureWithParty(game.creatures, game.parties, creatureId),
          {battleFieldElement}
        )
      })

    // TODO: 攻撃者リストを発動順に整列する。

    let creaturesBeingUpdated: Creature[] = game.creatures
    let partiesBeingUpdated: Party[] = game.parties
    let battleFieldMatrixBeingUpdated: BattleFieldMatrix = game.battleFieldMatrix

    // 攻撃者リストをループしてそれぞれの通常攻撃を発動する。
    attackerDataList.forEach((attackerData) => {
      // Only the "creature.id" should be referred because other properties may be updated.
      const attackerCreatureId = attackerData.creature.id

      const result = invokeNormalAttack({
        attackerCreatureId,
        creatures: creaturesBeingUpdated,
        parties: partiesBeingUpdated,
        battleFieldMatrix: battleFieldMatrixBeingUpdated,
      })

      creaturesBeingUpdated = result.creatures
      partiesBeingUpdated = result.parties
      battleFieldMatrixBeingUpdated = result.battleFieldMatrix
    })

    draft.game.creatures = creaturesBeingUpdated
    draft.game.parties = partiesBeingUpdated
    draft.game.battleFieldMatrix = battleFieldMatrixBeingUpdated
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}
