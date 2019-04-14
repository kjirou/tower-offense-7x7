import * as React from 'react';
import styled from 'styled-components';

type BattleFieldElement = {
  x: number,
  y: number,
};

const dummyMatrix: BattleFieldElement[][] = [];
for (let y = 0; y < 7; y++) {
  const row: BattleFieldElement[] = [];
  for (let x = 0; x < 7; x++) {
    row.push({
      y,
      x,
    });
  }
  dummyMatrix.push(row);
}

const MetaInformationBar = styled.div`
  position: relative;
  width: 360px;
  height: 48px;
  background-color: yellow;
`;

const Square = styled.div`
  width: 48px;
  height: 48px;
`;

const Board = styled.div`
  position: relative;
  width: 360px;
  height: 360px;
  background-color: green;
`;

function BattlePage(): JSX.Element {
  const style = {
    position: 'relative',
    width: '360px',
    height: '640px',
    backgroundColor: 'silver',
  };

  return (
    <div style={style}>
      <MetaInformationBar>MetaInformationBar!!</MetaInformationBar>
      <Board>Board!!</Board>
    </div>
  );
}

export default function Root(): JSX.Element {
  const style = {
    position: 'relative',
    margin: '0 auto',
    width: '360px',
    height: '640px',
  };

  return (
    <div style={style}><BattlePage /></div>
  );
}
