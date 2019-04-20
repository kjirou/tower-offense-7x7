import * as React from 'react';

import {Root} from './components/Root';
import {mapStateToProps} from './map-state-to-props';
import {ApplicationState} from './state-manager';

export function App(props: {initialState: ApplicationState}): JSX.Element {
  const [state, setState] = React.useState(props.initialState);

  const rootProps = mapStateToProps(state, setState);

  return <Root {...rootProps} />;
}
