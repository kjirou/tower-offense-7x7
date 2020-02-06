import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  App,
} from './App';
import {
  createInitialApplicationState,
} from './utils';

window.addEventListener('DOMContentLoaded', function() {
  const appDestination = document.querySelector('.js-app');

  if (appDestination) {
    const applicationState = createInitialApplicationState();

    ReactDOM.render(
      React.createElement(App, {initialState: applicationState}),
      appDestination
    );
  }
});
