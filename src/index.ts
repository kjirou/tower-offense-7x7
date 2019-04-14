import * as React from 'react';
import * as ReactDOM from 'react-dom';

function Root(): JSX.Element {
  return React.createElement('div', {}, 'Hello, React!');
}

window.addEventListener('DOMContentLoaded', function() {
  const appDestination = document.querySelector('.js-app');

  if (appDestination) {
    ReactDOM.render(
      React.createElement(Root, {}),
      appDestination
    );
  }
});
