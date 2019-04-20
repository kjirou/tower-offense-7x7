import * as React from 'react';
import {DragDropContext} from 'react-dnd';

const TouchBackend = require('react-dnd-touch-backend').default;

import {Root} from './components/Root';
import {mapStateToProps} from './map-state-to-props';
import {ApplicationState} from './state-manager/application';

function App_(props: {initialState: ApplicationState}): JSX.Element {
  const [state, setState] = React.useState(props.initialState);

  const rootProps = mapStateToProps(state, setState);

  return <Root {...rootProps} />;
}

export const App = DragDropContext(TouchBackend({ enableMouseEvents: true }))(App_);
