import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Root from './components/Root';
import {createInitialApplicationState} from './state-manager';

window.addEventListener('DOMContentLoaded', function() {
  const appDestination = document.querySelector('.js-app');

  if (appDestination) {
    const applicationState = createInitialApplicationState();

    ReactDOM.render(
      React.createElement(Root, {}),
      appDestination
    );
  }
});
