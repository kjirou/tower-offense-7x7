import * as assert from 'assert'
import {describe, it} from 'mocha'

import {
  NormalAttackContext,
  createBattleFieldMatrix,
  findCreatureById,
} from '../../utils'
import {
  invokeNormalAttack,
} from '../game'

describe('reducers/game', function() {
  describe('invokeNormalAttack', function() {
    describe('An attacker is adjacent to a single enemy', function() {
      const matrix = createBattleFieldMatrix(3, 3)
      const attacker = {
        id: 'a',
        jobId: '',
        attackPoint: 1,
        lifePoint: 1,
      }
      const enemy = {
        id: 'e',
        jobId: '',
        attackPoint: 1,
        lifePoint: 1,
      }
      matrix[1][1].creatureId = attacker.id
      matrix[1][2].creatureId = enemy.id
      const context: NormalAttackContext = {
        creatures: [attacker, enemy],
        parties: [
          {
            factionId: 'player',
            creatureIds: [attacker.id],
          },
          {
            factionId: 'computer',
            creatureIds: [enemy.id],
          }
        ],
        battleFieldMatrix: matrix,
        attackerCreatureId: attacker.id,
      }

      it('can attack the enemy', function() {
        const newContext = invokeNormalAttack(context)
        const newEnemy = findCreatureById(newContext.creatures, enemy.id)
        assert.strictEqual(newEnemy.lifePoint, 0)
      })
    })

    describe('An attacker and its enemy are two distances apart', function() {
      const matrix = createBattleFieldMatrix(3, 3)
      const attacker = {
        id: 'a',
        jobId: '',
        attackPoint: 1,
        lifePoint: 1,
      }
      const enemy = {
        id: 'e',
        jobId: '',
        attackPoint: 1,
        lifePoint: 1,
      }
      matrix[1][0].creatureId = attacker.id
      matrix[1][2].creatureId = enemy.id
      const context: NormalAttackContext = {
        creatures: [attacker, enemy],
        parties: [
          {
            factionId: 'player',
            creatureIds: [attacker.id],
          },
          {
            factionId: 'computer',
            creatureIds: [enemy.id],
          }
        ],
        battleFieldMatrix: matrix,
        attackerCreatureId: attacker.id,
      }

      it('can not attack the enemy', function() {
        const newContext = invokeNormalAttack(context)
        const newEnemy = findCreatureById(newContext.creatures, enemy.id)
        assert.strictEqual(newEnemy.lifePoint, 1)
      })
    })
  })
})
