import * as assert from 'assert'
import {describe, it} from 'mocha'

import {
  NormalAttackContext,
  createBattleFieldMatrix,
  ensureBattlePage,
  findCreatureById,
} from '../../utils'
import {
  createStateDisplayBattlePageAtStartOfGame,
  findFirstAlly,
} from '../../test-utils'
import {
  invokeNormalAttack,
} from '../game'

describe('reducers/game', function() {
  describe('invokeNormalAttack', function() {
    describe('When an attacker is adjacent to an enemy', function() {
      it('can attack the enemy', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const attacker = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        attacker.attackPoint = 1
        enemy.lifePoint = 2
        battlePage.game.battleFieldMatrix[0][0].creatureId = attacker.id
        battlePage.game.battleFieldMatrix[0][1].creatureId = enemy.id
        const context: NormalAttackContext = {
          creatures: battlePage.game.creatures,
          parties: battlePage.game.parties,
          battleFieldMatrix: battlePage.game.battleFieldMatrix,
          attackerCreatureId: attacker.id,
        }
        const newContext = invokeNormalAttack(context)
        const newEnemy = findCreatureById(newContext.creatures, enemy.id)
        assert.strictEqual(newEnemy.lifePoint < enemy.lifePoint, true)
      })
    })

    describe('When an attacker and its enemy are two distances apart', function() {
      it('can not attack the enemy', function() {
        const state = createStateDisplayBattlePageAtStartOfGame()
        const battlePage = ensureBattlePage(state)
        const attacker = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'player')
        const enemy = findFirstAlly(battlePage.game.creatures, battlePage.game.parties, 'computer')
        attacker.attackPoint = 1
        enemy.lifePoint = 2
        battlePage.game.battleFieldMatrix[0][0].creatureId = attacker.id
        battlePage.game.battleFieldMatrix[0][2].creatureId = enemy.id
        const context: NormalAttackContext = {
          creatures: battlePage.game.creatures,
          parties: battlePage.game.parties,
          battleFieldMatrix: battlePage.game.battleFieldMatrix,
          attackerCreatureId: attacker.id,
        }
        const newContext = invokeNormalAttack(context)
        const newEnemy = findCreatureById(newContext.creatures, enemy.id)
        assert.strictEqual(newEnemy.lifePoint, enemy.lifePoint)
      })
    })
  })
})
