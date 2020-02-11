import produce from 'immer'

import {
  ApplicationState,
  BattleFieldMatrix,
  BattlePageState,
  Creature,
  CreatureWithPartyOnBattleFieldElement,
  GameState,
  MatrixPosition,
  NormalAttackContext,
  Party,
  findCreatureWithParty,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils'
import {
  invokeNormalAttack,
} from './game/battle-process'

const ensureBattlePage = (state: ApplicationState): BattlePageState => {
  const battlePage = state.pages.battle
  if (battlePage === undefined) {
    throw new Error('`state.pages.battle` does not exist.')
  }
  return battlePage
}

export function touchBattleFieldElement(
  state: ApplicationState,
  y: MatrixPosition['y'],
  x: MatrixPosition['x']
): ApplicationState {
  const newBattlePage = produce(ensureBattlePage(state), draft => {
    if (
      draft.game.squareCursor &&
      y === draft.game.squareCursor.globalPosition.y &&
      x === draft.game.squareCursor.globalPosition.x
    ) {
      draft.game.squareCursor = undefined;
    } else {
      draft.game.squareCursor = {
        globalPosition: {
          matrixId: 'battleField',
          y,
          x,
        },
      }
    }
  })
  return Object.assign({}, state, {pages: {battle: newBattlePage}})
}

// TODO: state なのは自明だから、applicationState -> state で他は ~state 不要。
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
