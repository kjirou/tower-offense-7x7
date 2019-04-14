import * as React from 'react';

function MetaInformationBar(): JSX.Element {
  const style = {
    display: 'relative',
    width: '360px',
    height: '48px',
    backgroundColor: 'yellow',
  };

  return (
    <div style={style}>MetaInformationBar!</div>
  );
}

function Board(): JSX.Element {
  const style = {
    display: 'relative',
    width: '360px',
    height: '360px',
    backgroundColor: 'green',
  };

  return (
    <div style={style}>Board!</div>
  );
}

function BattlePage(): JSX.Element {
  const style = {
    display: 'relative',
    width: '360px',
    height: '640px',
    backgroundColor: 'silver',
  };

  return (
    <div style={style}>
      <MetaInformationBar />
      <Board />
    </div>
  );
}

export default function Root(): JSX.Element {
  const style = {
    display: 'relative',
    margin: '0 auto',
    width: '360px',
    height: '640px',
  };

  return (
    <div style={style}><BattlePage /></div>
  );
}
