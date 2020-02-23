import produce from 'immer'

import {
  ApplicationState,
  BattleFieldElement,
  BattlePage,
  Card,
  Creature,
  CreatureWithParty,
  CreatureWithPartyOnBattleFieldElement,
  GlobalPosition,
  MatrixPosition,
  Party,
  SkillProcessContext,
  areGlobalPositionsEqual,
  determineRelationshipBetweenFactions,
  ensureBattlePage,
  findBattleFieldElementByCreatureId,
  findCardUnderCursor,
  findCreatureById,
  findCreatureWithParty,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils'
import {
  creatureUtils,
  determinePositionsOfCreatureAppearance,
  invokeSkill,
  invokeNormalAttack,
  refillCardsOnPlayersHand,
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
          // 選択先クリーチャーがプレイヤー側のとき。
          if (placedCreatureWithParty.party.factionId === 'player') {
            // 行動可能なとき。
            if (creatureUtils.canAct(placedCreatureWithParty.creature)) {
              // スキルを発動する。
              const newContext = invokeSkill({
                creatures: draft.game.creatures,
                parties: draft.game.parties,
                battleFieldMatrix: draft.game.battleFieldMatrix,
                invokerCreatureId: placedCreatureWithParty.creature.id,
                skill: {
                  id: '',
                  skillCategoryId: 'attack',
                },
              })
              // スキル発動により死亡したクリーチャーが存在する位置をまとめる。
              const positionsOfDeadCreature: MatrixPosition[] = []
              for (const element of pickBattleFieldElementsWhereCreatureExists(newContext.battleFieldMatrix)) {
                if (element.creatureId !== undefined) {
                  const creature = findCreatureById(newContext.creatures, element.creatureId)
                  if (creatureUtils.isDead(creature)) {
                    positionsOfDeadCreature.push(element.position)
                  }
                }
              }
              // スキル発動の結果を反映する。
              draft.game.creatures = newContext.creatures
              draft.game.parties = newContext.parties
              draft.game.battleFieldMatrix = newContext.battleFieldMatrix
              // 盤上から死亡したクリーチャーを削除する。
              positionsOfDeadCreature.forEach(position => {
                const element = draft.game.battleFieldMatrix[position.y][position.x]
                const creatureId = element.creatureId
                if (creatureId !== undefined) {
                  // 盤上のクリーチャーを削除する。
                  element.creatureId = undefined
                  // プレイヤーのクリーチャーのときは、山札の末尾へ戻す。
                  const {party} = findCreatureWithParty(draft.game.creatures, draft.game.parties, creatureId)
                  if (party.factionId === 'player') {
                    draft.game.cardsInDeck.push({
                      creatureId,
                    })
                  }
                }
              })
              // 消費したカードを手札から削除する。
              draft.game.cardsOnPlayersHand = draft.game.cardsOnPlayersHand
                .filter(e => e.creatureId !== cardUnderCursor.creatureId)
              // 山札のカードへ消費したカードを戻す。
              draft.game.cardsInDeck.push({
                creatureId: cardUnderCursor.creatureId,
              })
              // カーソルを外す。
              draft.game.cursor = undefined
            // 行動不能なとき。
            } else {
              /* no-op */
            }
          // 選択先クリーチャーがプレイヤー側ではないとき。
          } else {
            /* no-op */
          }
        // 選択先のマスへクリーチャーが配置されていないとき。
        } else {
          // クリーチャーを配置する。
          battleFieldElement.creatureId = cardUnderCursor.creatureId
          // 手札のカードを一枚減らす。
          draft.game.cardsOnPlayersHand = draft.game.cardsOnPlayersHand
            .filter(e => e.creatureId !== cardUnderCursor.creatureId)
          // カーソルを外す。
          draft.game.cursor = undefined
        }
      // 手札のカードへカーソルが当たっていないとき。
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

export function selectCardOnPlayersHand(
  state: ApplicationState,
  creatureId: Creature['id'],
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    const touchedPosition: GlobalPosition = {
      globalPlacementId: 'cardsOnPlayersHand',
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
          globalPlacementId: 'cardsOnPlayersHand',
          creatureId,
        },
      }
    }
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}

export function runNormalAttackPhase(
  state: ApplicationState,
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    const game = draft.game

    if (game.completedNormalAttackPhase) {
      throw new Error('The normal-attack phase is over.')
    }

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

    let creaturesBeingUpdated = game.creatures
    let partiesBeingUpdated = game.parties
    let battleFieldMatrixBeingUpdated = game.battleFieldMatrix
    let cardsInDeckBeingUpdated = game.cardsInDeck

    // 攻撃者リストをループしてそれぞれの通常攻撃を発動する。
    attackerDataList.forEach((attackerData) => {
      // NOTE: この id と直上でまとめた更新用の値以外は参照しないこと。
      //       他の値はループ処理が始まれば陳腐化するため。
      const attackerCreatureId = attackerData.creature.id

      const attackerWithParty = findCreatureWithParty(
        creaturesBeingUpdated, partiesBeingUpdated, attackerCreatureId)

      // 攻撃者が行動不能のとき。
      if (!creatureUtils.canAct(attackerWithParty.creature)) {
        return
      }

      const result = invokeNormalAttack({
        attackerCreatureId,
        creatures: creaturesBeingUpdated,
        parties: partiesBeingUpdated,
        battleFieldMatrix: battleFieldMatrixBeingUpdated,
      })

      // 攻撃により死亡したクリーチャーが存在する位置をまとめる。
      const positionsOfDeadCreature: MatrixPosition[] = []
      for (const element of pickBattleFieldElementsWhereCreatureExists(result.battleFieldMatrix)) {
        if (element.creatureId !== undefined) {
          const creature = findCreatureById(result.creatures, element.creatureId)
          if (creatureUtils.isDead(creature)) {
            positionsOfDeadCreature.push(element.position)
          }
        }
      }

      creaturesBeingUpdated = result.creatures
      partiesBeingUpdated = result.parties
      battleFieldMatrixBeingUpdated = result.battleFieldMatrix
      positionsOfDeadCreature.forEach(position => {
        const element = battleFieldMatrixBeingUpdated[position.y][position.x]
        const creatureId = element.creatureId
        if (creatureId !== undefined) {
          // 盤上のクリーチャーを削除する。
          element.creatureId = undefined
          // プレイヤーのクリーチャーのときは、山札の末尾へ戻す。
          const {party} = findCreatureWithParty(creaturesBeingUpdated, partiesBeingUpdated, creatureId)
          if (party.factionId === 'player') {
            cardsInDeckBeingUpdated.push({
              creatureId,
            })
          }
        }
      })
    })

    draft.game.creatures = creaturesBeingUpdated
    draft.game.parties = partiesBeingUpdated
    draft.game.battleFieldMatrix = battleFieldMatrixBeingUpdated
    draft.game.cardsInDeck = cardsInDeckBeingUpdated
    draft.game.completedNormalAttackPhase = true
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}

export function proceedTurn(
  state: ApplicationState,
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    if (!draft.game.completedNormalAttackPhase) {
      throw new Error('The normal-attack phase must be completed.')
    }

    // TODO: Prohibit operation

    // 予約されているクリーチャーの出現が実現する。
    const realizedCreatureAppearances: MatrixPosition[] = []
    for (const row of draft.game.battleFieldMatrix) {
      for (const element of row) {
        if (element.reservedCreatureId !== undefined) {
          realizedCreatureAppearances.push(element.position)
        }
      }
    }

    // クリーチャーの出現が予約される。
    const creatureAppearances = determinePositionsOfCreatureAppearance(
      draft.game.battleFieldMatrix, draft.game.creatureAppearances, draft.game.turnNumber)

    // プレイヤーの手札を補充する。
    const newCardSets = refillCardsOnPlayersHand(draft.game.cardsInDeck, draft.game.cardsOnPlayersHand)

    realizedCreatureAppearances.forEach(position => {
      const element = draft.game.battleFieldMatrix[position.y][position.x]
      element.creatureId = element.reservedCreatureId
      element.reservedCreatureId = undefined
    })
    creatureAppearances.forEach(({position, creatureId}) => {
      draft.game.battleFieldMatrix[position.y][position.x].reservedCreatureId = creatureId
    })
    draft.game.cardsInDeck = newCardSets.cardsInDeck
    draft.game.cardsOnPlayersHand = newCardSets.cardsOnPlayersHand
    draft.game.completedNormalAttackPhase = false
    draft.game.turnNumber += 1
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}
