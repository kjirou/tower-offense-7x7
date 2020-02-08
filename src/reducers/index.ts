import produce from 'immer'

import {
  ApplicationState,
  BattlePageState,
  GameState,
  MatrixPosition,
} from '../utils'
import {
  invokeNormalAttack,
} from './game/battle-process'

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

export function proceedTurn(
  applicationState: ApplicationState,
): ApplicationState {
  // TODO: ターン数を増加する。
  // TODO: アニメーション用の情報を生成する。

  // 攻撃者リストを抽出する。
  // 攻撃者リストを発動順に整列する。
  // 攻撃者リストをループしてそれぞれの通常攻撃を発動する。
    // 通常攻撃コンテキストを生成する。
}
