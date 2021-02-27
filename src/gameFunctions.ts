import {Game,Table,Group,Tile,Line,Player,SelectedTile,SelectedLine} from './interfaces'

export const makeRandomGroup = ():Group => {
    const tiles = ['sun','moon','snow','leaf','dream'];
    const group = [...Array(4)].map(()=>{
        // 0~4の乱数を生成
        const random = Math.floor(Math.random() * 5)
        return tiles[random] as Tile
    })
    return group
}

const makeInitializedPlayer = (countPlayer:number):Player[] => {
    return [...Array(countPlayer)].map(()=>{
        return{
            work:[...Array(5)].map(()=>[]),
            board:[...Array(5)].map(()=>[]),
            over:[],
            point:0
        }
    })    
}

export const makeRandomTable = ():Table => {
    const center:Tile[] = ['first'];
    const groups = [...Array(5)].map(()=>{
        return makeRandomGroup()
    })
    return {groups,center}
}

export const initializedGame = ():Game => {
    return {
        players:makeInitializedPlayer(2),
        table:makeRandomTable(),
        nowPlaying:0
    }
}

export const lineCheck = (game:Game,selectedLine:SelectedLine,tile:Tile):boolean => {
    const anotherPlayer = selectedLine.playerIdx !== game.nowPlaying
    if(anotherPlayer){
        console.log('anotherPlayer')
        return false
    }
    const player = game.players[selectedLine.playerIdx]
    const emptyLine = player.work[selectedLine.lineIdx].length === 0
    const sameTileLine = !emptyLine && player.work[selectedLine.lineIdx][0] === tile
    const sameLineBoard = player.board[selectedLine.lineIdx]
    const boardExistSameTile = sameLineBoard.indexOf(tile) >= 0
    if(!emptyLine && !sameTileLine){
        console.log('!emptyLine && !sameTileLine')
        return false
    }
    if(boardExistSameTile){
        console.log('boardExistSameTile')
        return false
    }
    return true
}

const nextPlayer = (players:Player[],nowPlaying:number):number => {
    if(players.length > nowPlaying + 1){
        return nowPlaying + 1
    }
    return 0
}

export const gameStep = (game:Game,selectedTile:SelectedTile,selectedLine:SelectedLine):Game => {

    // 処理を行ってよいかチェックする（Todo 外部化して事前チェックし、そもそも処理を走らせないようにする）
    const tile = game.table.groups[selectedTile.tableIdx][selectedTile.tileIdx]
    if(!lineCheck(game,selectedLine,tile)){
        return game
    }
    if(game.table.groups.length !== 0){


        const targetGroup = game.table.groups[selectedTile.tableIdx]
        const targetTileType = targetGroup[selectedTile.tileIdx]
        const targetPlayer = game.players[selectedLine.playerIdx]
        const targetWorkLine = targetPlayer.work[selectedLine.lineIdx]

        // Tableの更新処理 Todo
        const newGropus:Group[] = []
        const newCenter:Tile[] = []
        const newTable:Table = {
            groups:newGropus,
            center:newCenter
        }

        // playerの更新
        const countSameTile = targetGroup.reduce((cnt,tile) => tile === targetTileType ? cnt + 1 : cnt, 0);
        const targetWorkCapacity = selectedLine.lineIdx + 1 - targetWorkLine.length;
        const addWorkTilesCount = targetWorkCapacity >= countSameTile ? countSameTile : targetWorkCapacity;
        const addWorkTiles = [...Array(addWorkTilesCount)].map(()=>targetTileType);
        const newWorkLine = [...targetPlayer.work[selectedLine.lineIdx],...addWorkTiles];
        targetPlayer.work.splice(selectedLine.lineIdx,1,newWorkLine);
        const addOverTilesCount = targetWorkCapacity >= countSameTile ? 0 : countSameTile - targetWorkCapacity;
        [...Array(addOverTilesCount)].forEach(()=>targetPlayer.over.push(targetTileType));
        
        // プレイヤーの更新処理
        const newNowPlaying = nextPlayer(game.players,game.nowPlaying)

        console.log({...game,table:newTable ,nowPlaying:newNowPlaying})
        return {...game,table:newTable ,nowPlaying:newNowPlaying}

    }else{
        // Todo 全部のgroupがなくなったときの処理
        return game
    }




}
