import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Root from './components/Root';

window.addEventListener('DOMContentLoaded', function() {
  const appDestination = document.querySelector('.js-app');

  if (appDestination) {
    ReactDOM.render(
      React.createElement(Root, {}),
      appDestination
    );
  }
});
