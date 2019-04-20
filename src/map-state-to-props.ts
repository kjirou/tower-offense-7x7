import {RootProps} from './components/Root';
import {BattlePageProps} from './components/pages/BattlePage';
import {ApplicationState} from './state-manager/application';
import {
  findCreatureByIdOrError,
} from './state-manager/game';
import {BattlePageState} from './state-manager/pages/battle';

export type ApplicationStateSetter = (applicationState: ApplicationState) => void;

function mapBattlePageStateToProps(
  state: BattlePageState,
  applicationState: ApplicationState,
  applicationStateSetter: ApplicationStateSetter
): BattlePageProps {
  const {
    barrackMatrix,
    battleFieldMatrix,
    creatures,
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

  const battleFieldBoard = battleFieldMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ? findCreatureByIdOrError(creatures, element.creatureId) : undefined;
      return {
        y: element.y,
        x: element.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
      };
    });
  });

  const barrackBoard = barrackMatrix.map(row => {
    return row.map(element => {
      const creature = element.creatureId ? findCreatureByIdOrError(creatures, element.creatureId) : undefined;

      return {
        y: element.y,
        x: element.x,
        creature: creature
          ? {
            image: jobIdToDummyImage(creature.jobId),
          }
          : undefined,
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
  if (state.pages.battle) {
    return {
      pages: {
        battle: mapBattlePageStateToProps(state.pages.battle, state, stateSetter),
      },
    };
  }

  throw new Error('Received invalid state.');
}
