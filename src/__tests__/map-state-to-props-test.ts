import * as assert from 'assert'
import {
  beforeEach,
  describe,
  it,
} from 'mocha'

import {
  ReactSetState,
  mapStateToProps,
} from '../map-state-to-props'
import {
  ApplicationState,
  BattlePage,
  Creature,
  ensureBattlePage,
  findCreatureById,
} from '../utils'
import {
  createStateDisplayBattlePageAtStartOfGame,
  findFirstAlly,
  ensureBattlePageProps,
} from '../test-utils'
import {
  selectBattleFieldElement,
} from '../reducers/index'
import {
  placePlayerFactionCreature,
} from '../reducers/utils'

describe('map-state-to-props', function() {
  const dummySetState = (() => {}) as ReactSetState

  describe('pages.battlePage', function() {
    let state: ApplicationState
    let battlePage: BattlePage

    beforeEach(function() {
      state = createStateDisplayBattlePageAtStartOfGame()
      battlePage = ensureBattlePage(state)
    })

    describe('選択したクリーチャーの自動攻撃範囲・対象・優先順位の表示', function() {
      describe('近接範囲を持つ player のクリーチャーへカーソルが当たっているとき', function() {
        let attacker: Creature

        beforeEach(function() {
          attacker = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
          battlePage.game = {
            ...battlePage.game,
            ...placePlayerFactionCreature(
              battlePage.game.creatures,
              battlePage.game.battleFieldMatrix,
              battlePage.game.cardsOnPlayersHand,
              attacker.id,
              {y: 1, x: 1}
            )
          }
          state = selectBattleFieldElement(state, 1, 1)
          battlePage = ensureBattlePage(state)
        })

        it('隣接している上下左右のマスの isWithinRange が true である', function() {
          const battlePageProps = ensureBattlePageProps(mapStateToProps(state, dummySetState))
          const board = battlePageProps.battleFieldBoard.board
          assert.strictEqual(board[0][1].isWithinRange, true)
          assert.strictEqual(board[1][0].isWithinRange, true)
          assert.strictEqual(board[1][2].isWithinRange, true)
          assert.strictEqual(board[2][1].isWithinRange, true)
        })

        it('隣接していないマスの isWithinRange は false である', function() {
          const battlePageProps = ensureBattlePageProps(mapStateToProps(state, dummySetState))
          const board = battlePageProps.battleFieldBoard.board
          assert.strictEqual(board[0][0].isWithinRange, false)
        })

        describe('1 体の味方と 1 体の敵に隣接しているとき', function() {
          beforeEach(function() {
            const ally = findCreatureById(
              battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[1].creatureId)
            battlePage.game = {
              ...battlePage.game,
              ...placePlayerFactionCreature(
                battlePage.game.creatures,
                battlePage.game.battleFieldMatrix,
                battlePage.game.cardsOnPlayersHand,
                ally.id,
                {y: 0, x: 1}
              )
            }
            const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
            battlePage.game.battleFieldMatrix[1][0].creatureId = enemy.id
            // TODO: 配置順と同期する必要があるため、敵の配置処理も関数化が必要
            const newAlly = findCreatureById(battlePage.game.creatures, ally.id)
            enemy.placementOrder = newAlly.placementOrder + 1
          })

          it('味方が存在しているマスは isTarget=false, targetPriority=undefined である', function() {
            const battlePageProps = ensureBattlePageProps(mapStateToProps(state, dummySetState))
            const board = battlePageProps.battleFieldBoard.board
            assert.strictEqual(board[0][1].isTarget, false)
            assert.strictEqual(board[0][1].targetPriority, undefined)
          })

          it('敵が存在しているマスは isTarget=true, targetPriority=1 である', function() {
            const battlePageProps = ensureBattlePageProps(mapStateToProps(state, dummySetState))
            const board = battlePageProps.battleFieldBoard.board
            assert.strictEqual(board[1][0].isTarget, true)
            assert.strictEqual(board[1][0].targetPriority, 1)
          })

          it('範囲内で敵が存在していないマスは isTarget=false, targetPriority=undefined, isWithinRange=true である', function() {
            const battlePageProps = ensureBattlePageProps(mapStateToProps(state, dummySetState))
            const board = battlePageProps.battleFieldBoard.board
            assert.strictEqual(board[1][2].isTarget, false)
            assert.strictEqual(board[1][2].targetPriority, undefined)
            assert.strictEqual(board[1][2].isWithinRange, true)
          })
        })
      })
    })
  })
})
