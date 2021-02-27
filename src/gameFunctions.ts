import {Game,Table,Group,Tile,Player,SelectedTile,SelectedLine} from './interfaces'

export const makeRandomGroup = ():Group => {
    const tiles = ['sum','moon','snow','leaf','dream'];
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
        return false
    }
    const player = game.players[selectedLine.playerIdx]
    const emptyLine = player.work[selectedLine.lineIdx].length === 0
    const sameTileLine = !emptyLine && player.work[selectedLine.lineIdx][0] === tile
    const sameLineBoard = player.board[selectedLine.lineIdx]
    const boardExistSameTile = sameLineBoard.indexOf(tile) >= 0
    if(!emptyLine && !sameTileLine){
        return false
    }
    if(boardExistSameTile){
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

    // 処理を行ってよいかチェックする（Todo 外部化）
    const tile = game.table.groups[selectedTile.tableIdx][selectedTile.tileIdx]
    if(lineCheck(game,selectedLine,tile)){
        return game
    }

    // Tableの更新処理 Todo
    const newGropus:Group[] = []
    const newCenter:Tile[] = []
    const newTable:Table = {
        groups:newGropus,
        center:newCenter
    }

    // Todo プレイヤー内のワーク、ボード、オーバーの更新処理

    // プレイヤーの更新処理
    const newNowPlaying = nextPlayer(game.players,game.nowPlaying)



    return {...game,table:newTable ,nowPlaying:newNowPlaying}
}
