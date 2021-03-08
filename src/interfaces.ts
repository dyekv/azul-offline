type Array5<T> = [T,T,T,T,T]

export interface Game {
    players:Player[]
    table:Table
    nowPlaying:number
}

export type Tile = 'moon' | 'sun' | 'dream' | 'leaf' | 'snow' | 'first'
export type Dish = Tile[]

export interface Table {
    dishes:Dish[]
    center:Tile[]
}

export type Line = Tile[]
export type boardLine = Array5<boolean>
export interface Player {
    work:Line[]
    // board:Array5<boardLine>
    board:boolean[][]
    over:Tile[]
    point:number
}

export interface SelectedTile {
    tableIdx:number
    tileIdx:number
}

export interface SelectedLine {
    playerIdx:number
    lineIdx:number
}