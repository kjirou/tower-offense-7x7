import produce from 'immer'

import {
  ApplicationState,
  BattleFieldMatrix,
  BattlePageState,
  Creature,
  CreatureWithPartyOnBattleFieldElement,
  GameState,
  MatrixPosition,
  findCreatureWithParty,
  pickBattleFieldElementsWhereCreatureExists,
} from '../utils'
import {
  invokeNormalAttack,
} from './game/battle-process'

// TODO: battlePageState を type guard して抽出すればいいだけっぽい
function updateBattlePageState(
  applicationState: ApplicationState,
  updater: (battlePageState: BattlePageState) => BattlePageState
): ApplicationState {
  const battlePageState = applicationState.pages.battle;
  if (battlePageState) {
    return Object.assign(
      {},
      applicationState,
      {
        pages: {
          battle: updater(battlePageState),
        },
      }
    );
  }
  throw new Error('The `applicationState.pages.battle` does not exist.');
}

export function touchBattleFieldElement(
  applicationState: ApplicationState,
  y: MatrixPosition['y'],
  x: MatrixPosition['x']
): ApplicationState {
  return updateBattlePageState(
    applicationState,
    battlePageState => {
      return produce(battlePageState, draft => {
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
    }
  )
}

// TODO: state なのは自明だから、applicationState -> state で他は ~state 不要。
export function proceedTurn(
  applicationState: ApplicationState,
): ApplicationState {
  return updateBattlePageState(
    applicationState,
    battlePageState => {
      return produce(battlePageState, draft => {
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

        // 攻撃者リストを発動順に整列する。

        // 攻撃者リストをループしてそれぞれの通常攻撃を発動する。
          // 通常攻撃コンテキストを生成する。
      })
    }
  )
}
