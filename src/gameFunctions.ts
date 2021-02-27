import {Game,Table,Group,Tile,Player,SelectedTile} from './interfaces'

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

export const gameStep = (game:Game,selectedTile:SelectedTile):Game => {
    const newGropus:Group[] = []
    const newCenter:Tile[] = []
    const newTable:Table = {
        groups:newGropus,
        center:newCenter
    }
    return {...game,table:newTable}
}
