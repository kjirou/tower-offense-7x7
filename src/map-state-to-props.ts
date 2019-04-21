import produce from 'immer';

import {RootProps} from './components/Root';
import {BattlePageProps} from './components/pages/BattlePage';
import {ApplicationState} from './state-manager/application';
import {
  areGlobalMatrixPositionsEqual,
  findCreatureByIdOrError,
} from './state-manager/game';
import {BattlePageState} from './state-manager/pages/battle';

export type ApplicationStateSetter = (applicationState: ApplicationState) => void;
type Dispatcher<State> = (callback: (draft: State) => void) => void;

function makeOneTimeApplicationDispatcher(
  applicationState: ApplicationState,
  applicationStateSetter: ApplicationStateSetter
): Dispatcher<ApplicationState> {
  let callCount = 0;
  return function dispatcher(immerCallback) {
    if (callCount > 0) {
      throw new Error('Can only call the dispatcher once in one Flux cycle.');
    }
    applicationStateSetter(
      produce(applicationState, immerCallback)
    );
    callCount++;
  }
}

function mapBattlePageStateToProps(
  state: BattlePageState,
  dispatcher: Dispatcher<ApplicationState>,
): BattlePageProps {
  const {
    barrackMatrix,
    battleFieldMatrix,
    creatures,
    squareCursor,
  } = state.game;

  function jobIdToDummyImage(jobId: string): string {
    const mapping: {
      [key: string]: string,
    } = {
      archer: '弓',
      fighter: '戦',
      knight: '重',
      mage: '魔',
    };
    return mapping[jobId] || '？';
  }

  const battleFieldBoard: BattlePageProps['battleFieldBoard'] = battleFieldMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ? findCreatureByIdOrError(creatures, element.creatureId) : undefined;

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
        isSelected: squareCursor
          ? areGlobalMatrixPositionsEqual(element.position, squareCursor.position)
          : false,
        handleTouch(payload) {
          dispatcher(draft => {
            // TODO: Pass a custom dispatcher for the battle page.
            if (draft.pages.battle) {
              draft.pages.battle.game.squareCursor = {
                position: {
                  matrixId: 'battleField',
                  y: payload.y,
                  x: payload.x,
                },
              };
            }
          });
        },
      };
    });
  });

  const barrackBoard: BattlePageProps['barrackBoard'] = barrackMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ? findCreatureByIdOrError(creatures, element.creatureId) : undefined;

      return {
        y: element.position.y,
        x: element.position.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
        isSelected: squareCursor
          ? areGlobalMatrixPositionsEqual(element.position, squareCursor.position)
          : false,
        handleTouch(payload) {
          dispatcher(draft => {
            // TODO: Pass a custom dispatcher for the battle page.
            if (draft.pages.battle) {
              draft.pages.battle.game.squareCursor = {
                position: {
                  matrixId: 'barrack',
                  y: payload.y,
                  x: payload.x,
                },
              };
            }
          });
        },
      };
    });
  });

  return {
    battleFieldBoard,
    barrackBoard,
  };
}

export function mapStateToProps(
  state: ApplicationState,
  stateSetter: ApplicationStateSetter
): RootProps {
  const oneTimeApplicationDispatcher = makeOneTimeApplicationDispatcher(state, stateSetter);

  if (state.pages.battle) {
    return {
      pages: {
        battle: mapBattlePageStateToProps(state.pages.battle, oneTimeApplicationDispatcher),
      },
    };
  }

  throw new Error('Received invalid state.');
}
