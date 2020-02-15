import {
  ApplicationState,
  Card,
  Creature,
  FactionId,
  Party,
  createBattleFieldMatrix,
  determineRelationshipBetweenFactions,
  findCreatureWithParty,
} from './utils'

/**
 * 整数を元にしたユニークIDを作成する関数を作成する
 *
 * ユニークIDの仕様は、呼び出し毎に整数として +1 され文字列化されたもの。
 * 例えば、0 を初期値とした初回の呼び出しは "1" 、次は "2" ... "10" ... 最大は "9007199254740991" である。
 * 最大の状態から呼び出した場合は例外を投げる。
 */
function createNumericUidCreator(startingCount: number): () => string {
  // Number.MAX_SAFE_INTEGER は IE に存在しないのでベタ書きする
  const maxSafeInteger = 9007199254740991
  let count = startingCount
  return () => {
    if (count >= maxSafeInteger) {
      throw new Error('It can no longer create UIDs')
    }
    count++
    return count.toString()
  };
}

const createUid = createNumericUidCreator(0)

function createCreature(): Creature {
  return {
    id: createUid(),
    jobId: '',
    attackPoint: 1,
    lifePoint: 1,
  }
}

export function findFirstEnemy(creatures: Creature[], parties: Party[], myFactionId: FactionId): Creature {
  for (const creature of creatures) {
    const creatureWithParty = findCreatureWithParty(creatures, parties, creature.id)
    if (determineRelationshipBetweenFactions(myFactionId, creatureWithParty.party.factionId) === 'enemy') {
      return creature
    }
  }
  throw new Error('Can not find an enemy.')
}

/**
 * 戦闘開始直後の BattlePage を想定した状態を生成する。
 */
export function createStateDisplayBattlePageAtStartOfGame(): ApplicationState {
  const allies = Array.from({length: 10}).map(() => createCreature())
  const enemies = Array.from({length: 10}).map(() => createCreature())
  const creatures = allies.concat(enemies)
  const cards: Card[] = allies.map(creature => {
    return {
      creatureId: creature.id,
      skillCategoryId: 'attack',
    }
  })
  return {
    pages: {
      battle: {
        game: {
          creatures,
          parties: [
            {
              factionId: 'player',
              creatureIds: allies.map(e => e.id),
            },
            {
              factionId: 'computer',
              creatureIds: enemies.map(e => e.id),
            },
          ],
          battleFieldMatrix: createBattleFieldMatrix(7, 7),
          cards,
          cardsOnYourHand: Array.from({length: 5}).map((e, index) => {
            return {
              creatureId: allies[index].id,
            }
          }),
          cursor: undefined,
        },
      },
    },
  }
}
