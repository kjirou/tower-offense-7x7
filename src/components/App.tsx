import * as React from 'react';

import Root, {Props as RootProps} from './Root';
import {ApplicationState} from '../state-manager';

function mapStateToProps(state: ApplicationState): RootProps {
  return {};
}

export default function App(props: {initialState: ApplicationState}): JSX.Element {
  const [state, setState] = React.useState(props.initialState);

  const rootProps = mapStateToProps(state);

  return <Root {...rootProps} />;
}
