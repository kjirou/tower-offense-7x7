import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './components/App';
import {createInitialApplicationState} from './state-manager';

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
