import produce from 'immer'

import {
  ACTION_POINTS_REQUIRED_FOR_CREATURE_PLACEMENT,
  ACTION_POINTS_REQUIRED_FOR_SKILL_USE,
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
  gameParameterUtils,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils'
import {
  determineVictoryOrDefeat,
  increaseRaidChargeForEachComputerCreatures,
  invokeAutoAttack,
  invokeRaid,
  invokeSkill,
  placePlayerFactionCreature,
  refillCardsOnPlayersHand,
  removeDeadCreatures,
  sortAutoAttackersOrder,
  spawnCreatures,
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
      // 勝敗決定前、または、自動攻撃フェーズ完了前、
      // かつ、手札のカードへカーソルが当たっているとき。
      if (
        (
          draft.game.battleResult.victoryOrDefeatId === 'pending' &&
          draft.game.completedAutoAttackPhase === false
        ) &&
        cardUnderCursor
      ) {
        // 選択先のマスへクリーチャーが配置されているとき。
        if (placedCreatureWithParty) {
          // 選択先クリーチャーがプレイヤー側のとき。
          if (placedCreatureWithParty.party.factionId === 'player') {
            // AP が 1 以上のとき、または、行動可能なとき。
            if (
              draft.game.actionPoints >= ACTION_POINTS_REQUIRED_FOR_SKILL_USE &&
              creatureUtils.canAct(placedCreatureWithParty.creature)
            ) {
              // スキルを発動する。
              draft.game = {
                ...draft.game,
                ...invokeSkill({
                  constants: draft.game.constants,
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

              // AP を 1 消費する。
              draft.game.actionPoints -= ACTION_POINTS_REQUIRED_FOR_SKILL_USE
              // カーソルを外す。
              draft.game.cursor = undefined
            // AP が 1 未満のとき、または、行動不能なとき。
            } else {
              /* no-op */
            }
          // 選択先クリーチャーがプレイヤー側ではないとき。
          } else {
            /* no-op */
          }
        // 選択先のマスへクリーチャーが配置されていないとき。
        } else {
          // AP が 2 以上のとき。
          if (draft.game.actionPoints >= ACTION_POINTS_REQUIRED_FOR_CREATURE_PLACEMENT) {
            // クリーチャーを配置する。
            // 手札からそのクリーチャーのカードを削除する。
            draft.game = {
              ...draft.game,
              ...placePlayerFactionCreature(
                draft.game.creatures,
                draft.game.battleFieldMatrix,
                draft.game.cardsOnPlayersHand,
                cardUnderCursor.creatureId,
                battleFieldElement.position
              ),
            }
            // AP を 2 消費する。
            draft.game.actionPoints -= ACTION_POINTS_REQUIRED_FOR_CREATURE_PLACEMENT
            // カーソルを外す。
            draft.game.cursor = undefined
          }
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

export function runAutoAttackPhase(
  state: ApplicationState,
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    const game = draft.game

    if (game.completedAutoAttackPhase) {
      throw new Error('The auto-attack phase is over.')
    }

    // TODO: アニメーション用の情報を生成する。

    // 攻撃者リストを抽出する。
    const elementsWhereCreatureExists =
      pickBattleFieldElementsWhereCreatureExists(game.battleFieldMatrix)
    let attackerDataList: CreatureWithPartyOnBattleFieldElement[] = elementsWhereCreatureExists
      .map((battleFieldElement) => {
        // NOTE: pickBattleFieldElementsWhereCreatureExists で creatureId が存在していることを保証している。
        const creatureId = battleFieldElement.creatureId as Creature['id']
        return Object.assign(
          findCreatureWithParty(game.creatures, game.parties, creatureId),
          {battleFieldElement}
        )
      })

    // 攻撃者リストを発動順に整列する。
    attackerDataList = sortAutoAttackersOrder(attackerDataList)

    let gameBeingUpdated = {...game}

    // 攻撃者リストをループし、それぞれの自動攻撃または襲撃を発動する。
    attackerDataList.forEach((attackerData) => {
      const attackerCreatureId = attackerData.creature.id

      const attackerWithParty = findCreatureWithParty(
        gameBeingUpdated.creatures, gameBeingUpdated.parties, attackerCreatureId)

      // 攻撃者が行動不能のときは自動攻撃または襲撃を行わない。
      if (!creatureUtils.canAct(attackerWithParty.creature)) {
        return
      }

      // 自動攻撃を試みる。
      gameBeingUpdated = {
        ...gameBeingUpdated,
        ...invokeAutoAttack(
          gameBeingUpdated.constants,
          gameBeingUpdated.creatures,
          gameBeingUpdated.parties,
          gameBeingUpdated.battleFieldMatrix,
          attackerCreatureId,
        ),
      }

      // computer 側クリーチャー、かつ、襲撃の充電が満タン、かつ、自動攻撃を行わなかった、とき。
      const attackerWithPartyAfterAttack = findCreatureWithParty(
        gameBeingUpdated.creatures, gameBeingUpdated.parties, attackerCreatureId)
      if (
        attackerWithPartyAfterAttack.party.factionId === 'computer' &&
        creatureUtils.isRaidChageFull(attackerWithPartyAfterAttack.creature, game.constants) &&
        attackerWithPartyAfterAttack.creature.autoAttackInvoked === false
      ) {
        // 襲撃を行う。
        gameBeingUpdated = {
          ...gameBeingUpdated,
          ...invokeRaid(
            gameBeingUpdated.constants,
            gameBeingUpdated.creatures,
            attackerWithPartyAfterAttack.creature.id,
            gameBeingUpdated.headquartersLifePoints,
          ),
        }
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
    })

    draft.game = gameBeingUpdated

    // 自動攻撃フェーズを終了する。
    draft.game.completedAutoAttackPhase = true
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}

export function proceedTurn(
  state: ApplicationState,
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    if (!draft.game.completedAutoAttackPhase) {
      throw new Error('The auto-attack phase must be completed.')
    }

    // computer 側クリーチャーの襲撃充電数の自然増加を行う。
    draft.game = {
      ...draft.game,
      ...increaseRaidChargeForEachComputerCreatures(
        draft.game.constants,
        draft.game.creatures,
        draft.game.parties,
        draft.game.battleFieldMatrix,
      ),
    }

    // 自動攻撃発動済みフラグを false へ戻す。
    draft.game = {
      ...draft.game,
      creatures: draft.game.creatures.map(creature => ({
        ...creature,
        autoAttackInvoked: false,
      }))
    }

    // クリーチャーを出現させる。
    draft.game = {
      ...draft.game,
      ...spawnCreatures(
        draft.game.creatures,
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

    // AP を回復する。
    draft.game = gameParameterUtils.alterActionPoints(
      draft.game,
      gameParameterUtils.getActionPointsRecovery(draft.game)
    )

    draft.game.completedAutoAttackPhase = false
    draft.game.turnNumber += 1
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}
