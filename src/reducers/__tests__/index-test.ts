import * as assert from 'assert'
import {
  beforeEach,
  describe,
  it,
} from 'mocha'

import {
  ApplicationState,
  BattlePage,
  Creature,
  DEFAULT_PLACEMENT_ORDER,
  Party,
  createBattleFieldMatrix,
  ensureBattlePage,
  findCreatureById,
} from '../../utils'
import {
  createStateDisplayBattlePageAtStartOfGame,
  findFirstAlly,
} from '../../test-utils'
import {
  proceedTurn,
  runAutoAttackPhase,
  selectBattleFieldElement,
} from '../index'
import {
  placePlayerFactionCreature,
} from '../utils'

describe('reducers/index', function() {
  describe('selectBattleFieldElement', function() {
    describe('In the case that select a card then select an empty element of the battle field', function() {
      let state: ApplicationState, newState: ApplicationState
      let battlePage: BattlePage, newBattlePage: BattlePage
      let allyCreatureId: Creature['id']

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        allyCreatureId = battlePage.game.cardsOnPlayersHand[0].creatureId
        battlePage.game.cursor = {
          globalPosition: {
            globalPlacementId: 'cardsOnPlayersHand',
            creatureId: allyCreatureId,
          },
        }
        newState = selectBattleFieldElement(state, 0, 0)
        newBattlePage = ensureBattlePage(newState)
      })

      it('should place an ally', function() {
        assert.strictEqual(newBattlePage.game.battleFieldMatrix[0][0].creatureId, allyCreatureId)
      })

      it('should reduce cards on player\'s hand', function() {
        assert.strictEqual(
          battlePage.game.cardsOnPlayersHand.length > newBattlePage.game.cardsOnPlayersHand.length,
          true
        )
      })

      it('should remove the cursor from the selcted card', function() {
        assert.strictEqual(newBattlePage.game.cursor, undefined)
      })
    })

    describe('In the case that select a card then select an enemy on the battle field', function() {
      let state: ApplicationState, newState: ApplicationState
      let battlePage: BattlePage, newBattlePage: BattlePage
      let allyCreatureId: Creature['id']

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        allyCreatureId = battlePage.game.cardsOnPlayersHand[0].creatureId
        battlePage.game.cursor = {
          globalPosition: {
            globalPlacementId: 'cardsOnPlayersHand',
            creatureId: allyCreatureId,
          },
        }
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        battlePage.game.battleFieldMatrix[0][0].creatureId = enemy.id
        newState = selectBattleFieldElement(state, 0, 0)
        newBattlePage = ensureBattlePage(newState)
      })

      it('should not reduce cards on player\'s hand', function() {
        assert.strictEqual(battlePage.game.cardsOnPlayersHand.length, newBattlePage.game.cardsOnPlayersHand.length)
      })
    })
  })

  describe('runAutoAttackPhase', function() {
    describe('敵対関係であるクリーチャーが隣接しているとき', function() {
      let state: ApplicationState
      let battlePage: BattlePage
      let a: Creature
      let b: Creature

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        a = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.creatures,
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            a.id,
            {y: 0, x: 0}
          )
        }
        battlePage.game.battleFieldMatrix[0][1].creatureId = b.id
      })

      it('互いに攻撃した結果を返す', function() {
        a.lifePoints = 2
        a._attackPowerForTest = 1
        b.lifePoints = 2
        b._attackPowerForTest = 1
        const newState = runAutoAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newA = findCreatureById(newBattlePage.game.creatures, a.id)
        const newB = findCreatureById(newBattlePage.game.creatures, b.id)
        assert.notStrictEqual(a.lifePoints, newA.lifePoints)
        assert.strictEqual(a.lifePoints > newA.lifePoints, true)
        assert.notStrictEqual(b.lifePoints, newB.lifePoints)
        assert.strictEqual(b.lifePoints > newB.lifePoints, true)
      })

      describe('a クリーチャーの攻撃で b クリーチャーが死亡するとき', function() {
        beforeEach(function() {
          a.lifePoints = 10
          a._attackPowerForTest = 1
          b.lifePoints = 1
          b._attackPowerForTest = 1
        })

        it('b が盤上に存在しない結果を返す', function() {
          const newState = runAutoAttackPhase(state)
          const newBattlePage = ensureBattlePage(newState)
          assert.strictEqual(newBattlePage.game.battleFieldMatrix[0][1].creatureId, undefined)
        })
      })

      describe('クリーチャーそれぞれがお互いの一回の攻撃で死亡するとき', function() {
        beforeEach(function() {
          a.lifePoints = 1
          a._attackPowerForTest = 1
          b.lifePoints = 1
          b._attackPowerForTest = 1
        })

        describe('computer 側クリーチャーが player 側クリーチャーより先に配置されているとき', function() {
          beforeEach(function() {
            a.placementOrder = 2
            b.placementOrder = 1
          })

          it('player 側クリーチャーの攻撃が先行するため computer 側クリーチャーが死亡し、player 側は無傷である', function() {
            const newState = runAutoAttackPhase(state)
            const newBattlePage = ensureBattlePage(newState)
            const newA = findCreatureById(newBattlePage.game.creatures, a.id)
            const newB = findCreatureById(newBattlePage.game.creatures, b.id)
            assert.strictEqual(newA.lifePoints, 1)
            assert.strictEqual(newB.lifePoints, 0)
          })
        })
      })
    })

    describe('味方関係であるクリーチャーが隣接しているとき', function() {
      it('互いに攻撃しなかった結果を返す', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const a = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        const b = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[1].creatureId)
        a.lifePoints = 2
        a._attackPowerForTest = 1
        b.lifePoints = 2
        b._attackPowerForTest = 1
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.creatures,
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            a.id,
            {y: 0, x: 0}
          )
        }
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.creatures,
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            b.id,
            {y: 0, x: 1}
          )
        }
        const newState = runAutoAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newA = findCreatureById(newBattlePage.game.creatures, a.id)
        const newB = findCreatureById(newBattlePage.game.creatures, b.id)
        assert.strictEqual(a.lifePoints, newA.lifePoints)
        assert.strictEqual(b.lifePoints, newB.lifePoints)
      })
    })

    describe('computer 側の攻撃で死亡する player 側のクリーチャーが存在するとき', function() {
      it('死亡した player 側のクリーチャーが山札の末尾へ戻る結果を返す', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const a = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        const b = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        a.lifePoints = 1
        a._attackPowerForTest = 1
        b.lifePoints = 10
        b._attackPowerForTest = 1
        battlePage.game = {
          ...battlePage.game,
          ...placePlayerFactionCreature(
            battlePage.game.creatures,
            battlePage.game.battleFieldMatrix,
            battlePage.game.cardsOnPlayersHand,
            a.id,
            {y: 0, x: 0}
          )
        }
        battlePage.game.battleFieldMatrix[0][1].creatureId = b.id
        const cardsInDeck = battlePage.game.cardsInDeck
        const newState = runAutoAttackPhase(state)
        const newBattlePage = ensureBattlePage(newState)
        const newCardsInDeck = newBattlePage.game.cardsInDeck
        assert.strictEqual(newCardsInDeck.length > cardsInDeck.length, true)
        assert.strictEqual(newCardsInDeck[newCardsInDeck.length - 1].creatureId, a.id)
      })
    })

    describe('襲撃の充電が満タンな computer 側クリーチャーが配置されているとき', function() {
      let state: ApplicationState
      let battlePage: BattlePage
      let c: Creature
      let p: Creature

      beforeEach(function() {
        state = createStateDisplayBattlePageAtStartOfGame()
        battlePage = ensureBattlePage(state)
        c = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        c._raidIntervalForTest = 1
        c.raidCharge = 1
        c._raidPowerForTest = 1
        p = findCreatureById(battlePage.game.creatures, battlePage.game.cardsOnPlayersHand[0].creatureId)
        battlePage.game.battleFieldMatrix[0][0].creatureId = c.id
      })

      describe('player 側クリーチャーが自動攻撃の範囲内にいるとき', function() {
        beforeEach(function() {
          battlePage.game = {
            ...battlePage.game,
            ...placePlayerFactionCreature(
              battlePage.game.creatures,
              battlePage.game.battleFieldMatrix,
              battlePage.game.cardsOnPlayersHand,
              p.id,
              {y: 0, x: 1},
            )
          }
        })

        it('本拠地は襲撃されない', function() {
          const newState = runAutoAttackPhase(state)
          const newBattlePage = ensureBattlePage(newState)
          assert.strictEqual(newBattlePage.game.headquartersLifePoints, battlePage.game.headquartersLifePoints)
        })
      })

      describe('player 側クリーチャーが自動攻撃の範囲内にいないとき', function() {
        it('本拠地は襲撃される', function() {
          const newState = runAutoAttackPhase(state)
          const newBattlePage = ensureBattlePage(newState)
          assert.strictEqual(
            newBattlePage.game.headquartersLifePoints < battlePage.game.headquartersLifePoints,
            true
          )
        })
      })
    })
  })

  describe('proceedTurn', function() {
    let state: ApplicationState
    let battlePage: BattlePage

    beforeEach(function() {
      state = createStateDisplayBattlePageAtStartOfGame()
      battlePage = ensureBattlePage(state)
    })

    it('クリーチャーの自動攻撃発動済みフラグを一律 false へ更新する', function() {
      const a = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
      a.autoAttackInvoked = true
      const newState = proceedTurn(runAutoAttackPhase(state))
      const newBattlePage = ensureBattlePage(newState)
      const newA = findCreatureById(newBattlePage.game.creatures, a.id)
      assert.strictEqual(newA.autoAttackInvoked, false)
    })

    it('actionPoints を actionPointsRecovery の分回復する', function() {
      battlePage.game.actionPoints = 2
      battlePage.game.actionPointsRecovery = 3
      const newState = proceedTurn(runAutoAttackPhase(state))
      const newBattlePage = ensureBattlePage(newState)
      assert.strictEqual(newBattlePage.game.actionPoints, 5)
    })

    it('配置されていないクリーチャーの配置順は初期値と等しい', function() {
      const newState = proceedTurn(runAutoAttackPhase(state))
      const newBattlePage = ensureBattlePage(newState)
      for (const newCreature of newBattlePage.game.creatures) {
        assert.strictEqual(newCreature.placementOrder, DEFAULT_PLACEMENT_ORDER)
      }
    })
  })
})
