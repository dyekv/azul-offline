import React,{useState,useEffect} from 'react';
import './App.css';
import {Game,Table,Group,Tile,SelectedTile} from './interfaces'
import {initializedGame,makeRandomGroup,makeRandomTable} from './gameFunctions'

// import {Box} from '@chakra-ui/react'


function App() {

  const [game,setGame] = useState<Game>(initializedGame())
  const [selectedTile,setSelectedTile] = useState<SelectedTile>()

  return (
    <div className="game-wrapper">
      <div className="tables-wrapper">
        {game.table.groups.map((group,tableIdx) => {
          return <div key={tableIdx} className={"table-"+(tableIdx+1)}>{group.map((tile,tileIdx) => {
            const isSelectedTile = selectedTile?.tableIdx === tableIdx && selectedTile.tileIdx === tileIdx
            return <div 
              className="tile" 
              key={tileIdx} 
              style={isSelectedTile ? {color:'red'} : undefined}
              onClick={()=>setSelectedTile({tableIdx,tileIdx})}
            >
              {tile}
            </div>
          })}</div>
        })}
      </div>
      <div className="players-wrapper">
        {game.players.map((player,idx)=>{
          return <div key={idx} className="player">
            <div className="point">{player.point}</div>
            <div className="work">
              {player.work.map((line,idx)=>{
                return <div className="line" key={idx}>
                  {line.map((tile,idx)=>{
                    return <div className="tile" key={idx}>{tile}</div>
                  })}
                </div>
              })}
            </div>
            <div className="over">
              {player.over.map((tile,idx)=>{
                  return <div className="tile" key={idx}>{tile}</div>
                })}
            </div>
            <div className="board">
              {player.board.map((line,idx)=>{
                return <div className="line" key={idx}>
                  {line.map((tile,idx)=>{
                    return <div className="tile" key={idx}>{tile}</div>
                  })}
                </div>
              })}
            </div>
          </div>
        })}
      </div>
    </div>
  );
}

export default App;
