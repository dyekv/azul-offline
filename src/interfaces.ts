export interface Game {
    players:Player[]
    table:Table
    nowPlaying:number
}

export type Tile = 'moon' | 'sun' | 'dream' | 'leaf' | 'snow' | 'first'
export type Group = Tile[]

export interface Table {
    groups:Group[]
    center:Tile[]
}

export type Line = Tile[]
export interface Player {
    work:Line[]
    board:Line[]
    over:Tile[]
}