import * as React from 'react';

import {
  Root,
} from './components/Root';
import {
  mapStateToProps,
} from './map-state-to-props';
import {
  ApplicationState,
} from './utils';

type Props = {
  initialState: ApplicationState,
}

export const App: React.FC<Props> = (props) => {
  const [state, setState] = React.useState(props.initialState);
  console.log('state:', state);

  const rootProps = mapStateToProps(state, setState);

  return <Root {...rootProps} />;
}
