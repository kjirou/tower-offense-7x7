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
  areGlobalPositionsEqual,
  choiceElementsAtRandom,
  creatureUtils,
  determineRelationshipBetweenFactions,
  ensureBattlePage,
  findBattleFieldElementByCreatureId,
  findCardUnderCursor,
  findCreatureById,
  findCreatureWithParty,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils'
import {
  determineVictoryOrDefeat,
  findNormalAttackTargeteeCandidates,
  increaseRaidChargeForEachComputerCreatures,
  invokeNormalAttack,
  invokeRaid,
  invokeSkill,
  placePlayerFactionCreature,
  refillCardsOnPlayersHand,
  removeDeadCreatures,
  reserveCreatures,
} from './utils'

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

      // カードの使用（クリーチャーの配置・スキルの使用）をする。
      //
      // 勝敗決定前、または、通常攻撃フェーズ完了前、
      // かつ、手札のカードへカーソルが当たっているとき。
      if (
        (
          draft.game.battleResult.victoryOrDefeatId === 'pending' &&
          draft.game.completedNormalAttackPhase === false
        ) &&
        cardUnderCursor
      ) {
        // 選択先のマスへクリーチャーが配置されているとき。
        if (placedCreatureWithParty) {
          // 選択先クリーチャーがプレイヤー側のとき。
          if (placedCreatureWithParty.party.factionId === 'player') {
            // 行動可能なとき。
            if (creatureUtils.canAct(placedCreatureWithParty.creature)) {
              // スキルを発動する。
              draft.game = {
                ...draft.game,
                ...invokeSkill({
                  jobs: draft.game.jobs,
                  creatures: draft.game.creatures,
                  parties: draft.game.parties,
                  battleFieldMatrix: draft.game.battleFieldMatrix,
                  invokerCreatureId: placedCreatureWithParty.creature.id,
                  skill: {
                    id: '',
                    skillCategoryId: 'attack',
                  },
                })
              }

              // 消費したカードを手札から削除する。
              draft.game.cardsOnPlayersHand = draft.game.cardsOnPlayersHand
                .filter(e => e.creatureId !== cardUnderCursor.creatureId)

              // 山札のカードへ消費したカードを戻す。
              draft.game.cardsInDeck.push({
                creatureId: cardUnderCursor.creatureId,
              })

              // 盤上から死亡したクリーチャーを削除する。
              // 削除されたプレイヤーのクリーチャーは山札の末尾へ戻す。
              draft.game = {
                ...draft.game,
                ...removeDeadCreatures(
                  draft.game.creatures,
                  draft.game.parties,
                  draft.game.battleFieldMatrix,
                  draft.game.cardsInDeck
                ),
              }

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
          // 手札からそのクリーチャーのカードを削除する。
          draft.game = {
            ...draft.game,
            ...placePlayerFactionCreature(
              draft.game.battleFieldMatrix,
              draft.game.cardsOnPlayersHand,
              cardUnderCursor.creatureId,
              battleFieldElement.position
            ),
          }
          // カーソルを外す。
          draft.game.cursor = undefined
        }
      // カードの使用、ができないとき。
      } else {
        // カーソルをマスの選択へ変更する。
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
        // NOTE: pickBattleFieldElementsWhereCreatureExists で creatureId が存在していることを保証している。
        const creatureId = battleFieldElement.creatureId as Creature['id']
        return Object.assign(
          findCreatureWithParty(game.creatures, game.parties, creatureId),
          {battleFieldElement}
        )
      })

    // TODO: 攻撃者リストを発動順に整列する。

    let gameBeingUpdated = {...game}

    // 攻撃者リストをループし、それぞれの通常攻撃または襲撃を発動する。
    attackerDataList.forEach((attackerData) => {
      const attackerCreatureId = attackerData.creature.id

      const attackerWithParty = findCreatureWithParty(
        gameBeingUpdated.creatures, gameBeingUpdated.parties, attackerCreatureId)

      // 攻撃者が行動不能のときは通常攻撃または襲撃を行わない。
      if (!creatureUtils.canAct(attackerWithParty.creature)) {
        return
      }

      // 通常攻撃の範囲内に敵が存在するかを判定する。
      const hasTargeteeCandidates = findNormalAttackTargeteeCandidates(
        gameBeingUpdated.jobs,
        gameBeingUpdated.creatures,
        gameBeingUpdated.parties,
        gameBeingUpdated.battleFieldMatrix,
        attackerCreatureId,
      ).length > 0

      // 通常攻撃の範囲内に対象が存在するとき。
      if (hasTargeteeCandidates) {
        // 通常攻撃を行う。
        gameBeingUpdated = {
          ...gameBeingUpdated,
          ...invokeNormalAttack(
            gameBeingUpdated.jobs,
            gameBeingUpdated.creatures,
            gameBeingUpdated.parties,
            gameBeingUpdated.battleFieldMatrix,
            attackerCreatureId,
          ),
        }

        // 盤上から死亡したクリーチャーを削除する。
        // 削除されたプレイヤーのクリーチャーは山札の末尾へ戻す。
        gameBeingUpdated = {
          ...gameBeingUpdated,
          ...removeDeadCreatures(
            gameBeingUpdated.creatures,
            gameBeingUpdated.parties,
            gameBeingUpdated.battleFieldMatrix,
            gameBeingUpdated.cardsInDeck
          )
        }
      // 通常攻撃の範囲内に対象が存在しない、
      // かつ、computer 側クリーチャー、かつ、襲撃充電が満タンのとき。
      } else if (
        attackerData.party.factionId === 'computer' &&
        creatureUtils.isRaidChageFull(attackerData.creature, game.jobs)
      ) {
        // 襲撃をする。
        gameBeingUpdated = {
          ...gameBeingUpdated,
          ...invokeRaid(
            gameBeingUpdated.jobs,
            gameBeingUpdated.creatures,
            attackerData.creature.id,
            gameBeingUpdated.headquartersLifePoints,
          ),
        }
      }
    })

    draft.game = gameBeingUpdated

    // 通常攻撃フェーズを終了する。
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

    // computer 側クリーチャーの襲撃充電数の自然増加を行う。
    draft.game = {
      ...draft.game,
      ...increaseRaidChargeForEachComputerCreatures(
        draft.game.jobs,
        draft.game.creatures,
        draft.game.parties,
        draft.game.battleFieldMatrix,
      ),
    }

    // 予約されているクリーチャーの出現が実現する。
    const realizedCreatureAppearances: MatrixPosition[] = []
    for (const row of draft.game.battleFieldMatrix) {
      for (const element of row) {
        if (element.reservedCreatureId !== undefined) {
          realizedCreatureAppearances.push(element.position)
        }
      }
    }
    realizedCreatureAppearances.forEach(position => {
      const element = draft.game.battleFieldMatrix[position.y][position.x]
      element.creatureId = element.reservedCreatureId
      element.reservedCreatureId = undefined
    })

    // クリーチャーの出現を予約する。
    draft.game = {
      ...draft.game,
      ...reserveCreatures(
        draft.game.battleFieldMatrix,
        draft.game.creatureAppearances,
        draft.game.turnNumber,
        (elements: BattleFieldElement[], numberOfElements: number): BattleFieldElement[] => {
          return choiceElementsAtRandom<BattleFieldElement>(elements, numberOfElements)
        }
      ),
    }

    // プレイヤーの手札を補充する。
    draft.game = {
      ...draft.game,
      ...refillCardsOnPlayersHand(draft.game.cardsInDeck, draft.game.cardsOnPlayersHand),
    }

    // 勝敗判定をする。
    draft.game.battleResult.victoryOrDefeatId = determineVictoryOrDefeat(
      draft.game.parties,
      draft.game.battleFieldMatrix,
      draft.game.creatureAppearances,
      draft.game.turnNumber,
      draft.game.headquartersLifePoints
    )

    draft.game.completedNormalAttackPhase = false
    draft.game.turnNumber += 1
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}
