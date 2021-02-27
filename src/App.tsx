import React,{useState,useEffect} from 'react';
import './App.css';
import {Game,Table,Group,Tile,SelectedTile,SelectedLine} from './interfaces'
import {initializedGame,gameStep,lineCheck} from './gameFunctions'

// import {Box} from '@chakra-ui/react'


function App() {

  const [game,setGame] = useState<Game>(initializedGame())
  const [selectedTile,setSelectedTile] = useState<SelectedTile>()

  const onClickWorkLine = (selectedLine:SelectedLine) => {
    if(selectedTile !== undefined){
      const selectedGroup = selectedTile.tableIdx === -1 ? game.table.center : game.table.groups[selectedTile.tableIdx]
      const tileType = selectedGroup[selectedTile.tileIdx]
      if(lineCheck(game,selectedLine,tileType)){
        setGame(gameStep(game,selectedTile,selectedLine))
        setSelectedTile(undefined)
      }
    }
  }

  return (
    <div className="game-wrapper">
      <div className="tables-wrapper">
        {game.table.groups.map((group,tableIdx) => {
          return <div key={tableIdx} className={"table-"+(tableIdx+1)} style={{backgroundColor:"#DDD",margin:'20px 0', display:'flex'}}>
            {group.map((tile,tileIdx) => {
              const isSelectedTile = selectedTile?.tableIdx === tableIdx && selectedTile.tileIdx === tileIdx
              return <div 
                className="tile" 
                key={tileIdx} 
                style={{color:isSelectedTile ?'red':'#000',marginRight:20}}
                onClick={()=>setSelectedTile({tableIdx,tileIdx})}
              >
                {tile}
              </div>
          })}</div>
        })}
        <div className="table-center" style={{margin:'20px 0',backgroundColor:'#FDF',display:'flex'}}>{game.table.center.map((tile,idx)=>{
          const isSelectedTile = selectedTile?.tableIdx === -1 && selectedTile.tileIdx === idx
          return <div 
            key={idx} 
            className="tile" 
            style={{color:isSelectedTile ?'red':'#000',marginRight:20}}
            onClick={()=>setSelectedTile({tableIdx:-1,tileIdx:idx})}
          >{tile}</div>
        })}</div>
      </div>
      <div className="players-wrapper">
        {game.players.map((player,playerIdx)=>{
          return <div key={playerIdx} className="player" style={{margin:'20px 0',backgroundColor:'#DDD'}}>
            <div className="point">{player.point}</div>
            <div className="work">
              {player.work.map((line,lineIdx)=>{
                return <div className="line" key={lineIdx} style={{margin:5,border:'1px solid #777',height:32, display:'flex'}} onClick={()=>onClickWorkLine({playerIdx,lineIdx})}>
                  {line.map((tile,idx)=>{
                    return <div className="tile" key={idx} style={{marginRight:20}}>{tile}</div>
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
