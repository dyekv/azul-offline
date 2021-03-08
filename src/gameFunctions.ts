import {
  Game,
  Table,
  Group,
  Tile,
  Line,
  Player,
  SelectedTile,
  SelectedLine,
} from "./interfaces";

import {
  deepCopyAoa,
  mapTimes,
  roopTimes,
} from './utils'


export const initializedGame = (): Game => {
  return {
    players: makeInitializedPlayer(2),
    table: makeRandomTable(),
    nowPlaying: 0,
  };
};

const makeInitializedPlayer = (countPlayer: number): Player[] => {
  return mapTimes(() => ({
      work: mapTimes<Line>(()=>[], 5),
      board: mapTimes(() => mapTimes(()=>false, 5), 5),
      over: [],
      point: 0,
    }), countPlayer);
};

export const makeRandomTable = (): Table => {
  const center: Tile[] = ["first"];
  const groups = mapTimes(makeRandomGroup,5)
  return { groups, center };
};

export const makeRandomGroup = (): Group => {
  const tiles: Tile[] = ["sun", "moon", "snow", "leaf", "dream"];
  const group = mapTimes(() => {
    // 0~4の乱数を生成
    const random = Math.floor(Math.random() * 5);
    return tiles[random];
  }, 4);
  return group;
};

export const lineCheck = (
  game: Game,
  selectedLine: SelectedLine,
  selectedTileType: Tile
): boolean => {
  const isAnotherPlayer = selectedLine.playerIdx !== game.nowPlaying;
  const player = game.players[selectedLine.playerIdx];
  const emptyLine = player.work[selectedLine.lineIdx].length === 0;
  const sameTileLine =
    !emptyLine && player.work[selectedLine.lineIdx][0] === selectedTileType;
  const mappingBoard = makeMappingBoard()
  const sameLineBoard = mappingBoard[selectedLine.lineIdx];
  const mappingIndex = sameLineBoard.indexOf(selectedTileType);
  const boardExistSameTile = player.board[selectedLine.lineIdx][mappingIndex];

  // 選択したWorkが妥当かチェックする
  if (isAnotherPlayer) {
    console.log("Error anotherPlayer");
    return false;
  }
  if (!emptyLine && !sameTileLine) {
    console.log("Error anotherTile exist on this line");
    return false;
  }
  if (boardExistSameTile) {
    console.log("Error SameTile exist on board");
    return false;
  }
  return true;
};

const nextPlayer = (players: Player[], nowPlaying: number): number => {
  if (players.length > nowPlaying + 1) {
    return nowPlaying + 1;
  }
  return 0;
};

interface gameStepArgs {
  game: Game
  selectedTile: SelectedTile
  selectedLine: SelectedLine
}

type gameStep = (props:gameStepArgs) => Game

export const gameStep: gameStep = (props) => {
  const { game, selectedTile, selectedLine } = props;
  const targetPlayer = game.players[selectedLine.playerIdx];
  const isSelectCenter = selectedTile.tableIdx < 0;
  const targetGroup = isSelectCenter
    ? game.table.center
    : game.table.groups[selectedTile.tableIdx];
  const targetTileType = targetGroup[selectedTile.tileIdx];
  const isSelectOver = selectedLine.lineIdx < 0;
  const targetWorkLine = isSelectOver
    ? targetPlayer.over
    : targetPlayer.work[selectedLine.lineIdx];

  // playerの更新
  // テーブルの真ん中からタイルを選択したときに、1stタイルがあればOverに入れる
  const isGetFirst = isSelectCenter && targetGroup.indexOf("first") >= 0;
  if (isGetFirst) targetPlayer.over.push("first");
  // 選択したタイルが同グループ内に何枚あるかをカウント
  const countSameTileReducer = (cnt: number, tile: Tile): number => tile === targetTileType ? cnt + 1 : cnt;
  const countSameTileInTargetGroup = targetGroup.reduce(countSameTileReducer, 0);
  // Workのキャパシティを超えないように上記の枚数を加える
  const targetWorkCapacity = isSelectOver ? 99 : selectedLine.lineIdx + 1 - targetWorkLine.length;
  const OverWorkCapacity = targetWorkCapacity < countSameTileInTargetGroup
  const addWorkTilesCount = OverWorkCapacity ? targetWorkCapacity : countSameTileInTargetGroup;
  roopTimes(() => targetWorkLine.push(targetTileType), addWorkTilesCount);
  // 選択したWorkのキャパシティを超える分は、Overに入れる
  const addOverTilesCount = OverWorkCapacity ? countSameTileInTargetGroup - targetWorkCapacity : 0;
  const addOverTiles = mapTimes(() => targetTileType, addOverTilesCount);
  targetPlayer.over.push(...addOverTiles);

  // Tableの更新
  // テーブルの真ん中からタイルを選択したときは、選択したタイルと1stタイルを取り除く
  if (isSelectCenter) {
    const newCenter = targetGroup.filter(
      (tile) => tile !== targetTileType && tile !== "first"
    );
    game.table.center = newCenter;
  // グループからタイルを取得したときは、違う種類のタイルは真ん中に移動し、グループごと取り除く
  } else {
    const addCenter = targetGroup.filter((tile) => tile !== targetTileType);
    game.table.center.push(...addCenter);
    game.table.groups.splice(selectedTile.tableIdx, 1);
  }

  // 操作ターンのプレイヤーの更新
  const newNowPlaying = nextPlayer(game.players, game.nowPlaying);

  // テーブルのタイルがなくなったときの処理（フェイズ終了）
  if (game.table.groups.length === 0 && game.table.center.length === 0) {
    const newTable = makeRandomTable();
    const nextNowPlaying = game.players.findIndex(
      (player) => player.over.indexOf("first") > -1
    );
    const newPlayers = game.players.map((player) => {
      return playerCalc(player);
    });

    // Todo ゲームクリア判定

    // Todo ゲーム終了時の得点計算

    // Todo 勝敗判定、勝敗表示？

    console.log("なくなった");
    return {
      table: newTable,
      players: newPlayers,
      nowPlaying: nextNowPlaying,
    };
  }
  return { ...game, nowPlaying: newNowPlaying };
};

const playerCalc = (player: Player): Player => {
  const oldBoard: boolean[][] = deepCopyAoa<boolean>(player.board);
  const newBoard = makeNewBoardAndNewWork(oldBoard,player.work);
  
  const additionalPoint = additionalPointsCalc(oldBoard, newBoard);
  const mainusPoint = mainusPointsCalc(player.over.length);
  const playerPoint = player.point + additionalPoint - mainusPoint;
  return {
    point: playerPoint,
    board: newBoard,
    work: player.work,
    over: [],
  };
};

export const lineIdxAndTileTypeToTileIdx = (lineIdx:number,tileType:Tile):number=> {
  const mappingBoard = makeMappingBoard()
  const targetLine = mappingBoard[lineIdx]
  return targetLine.indexOf(tileType)
}

const makeNewBoardAndNewWork = (oldBoard:boolean[][],work:Line[]):boolean[][] => {
  const newBoard = deepCopyAoa<boolean>(oldBoard)
  work.forEach((line,lineIdx)=>{
    if(line.length > lineIdx){
      const tileIdx = lineIdxAndTileTypeToTileIdx(lineIdx,line[0])
      newBoard[lineIdx].splice(tileIdx,1,true)
      work.splice(lineIdx,1,[])
    }
  })
  return newBoard
}

const additionalPointsCalc = (oldBoard: boolean[][], newBoard: boolean[][]): number => {
  // Todo add ボードを比較して加算される点数を計算する処理
  
  let additionalPoint = 0
  const addPoints = (y:number,x:number):void=>{
    additionalPoint += 1
    additionalPoint += searchUp(newBoard,x,y)
    additionalPoint += searchDown(oldBoard,x,y)
    additionalPoint += searchLeft(newBoard,x,y)
    additionalPoint += searchRight(oldBoard,x,y)
  }
  const searchUp = (board:boolean[][],x:number,y:number):number => {
    let point = 0;
    while(y >=0 ){
        if(board[y][x]){
            point ++
            y--
        }else{
            break;
        }
    }
    return point
}
const searchDown = (board:boolean[][],x:number,y:number):number => {
    let point = 0;
    while(y < 5 ){
        if(board[y][x]){
            point ++
            y++
        }else{
            break;
        }
    }
    return point
}
const searchLeft = (board:boolean[][],x:number,y:number):number => {
    let point = 0;
    while(x >=0 ){
        if(board[y][x]){
            point ++
            x--
        }else{
            break;
        }
    }
    return point
}
const searchRight = (board:boolean[][],x:number,y:number):number => {
    let point = 0;
    while(x < 5 ){
        if(board[y][x]){
            point ++
            x++
        }else{
            break;
        }
    }
    return point
}

  newBoard.forEach((line, lineIdx) => {
    line.forEach((isTile,tileIdx)=>{
      if(oldBoard[lineIdx][tileIdx] === isTile) addPoints(lineIdx,tileIdx)
    })
});
  return additionalPoint;
};


const mainusPointsCalc = (tileCount: number): number => {
  const mainusPointsArray = [1, 1, 2, 2, 2]; // 減点の数列は、1,1,2,2,2,3,3,...
  let mainusPoint = 0;
  roopTimes((_, idx) => {
    if (idx < mainusPointsArray.length) {
      mainusPoint += mainusPointsArray[idx];
    } else {
      mainusPoint += 3;
    }
  }, tileCount);
  return mainusPoint;
};

export const makeMappingBoard = (): Line[] => {
  const tiles = ["sun", "moon", "snow", "leaf", "dream"] as Line;
  const tileMapping = (lineIdx: number): Tile[] => {
    return mapTimes((_, idx) => {
      const mappingIdx = (idx + lineIdx) % 5;
      return tiles[mappingIdx];
    }, 5);
  };
  const mapping = mapTimes((_, idx) => tileMapping(idx), 5);
  return mapping;
};

const mapping = (board: Line[]): boolean[][] => {
  const mappingBoard = makeMappingBoard();
  const mappingResult = mappingBoard.map((mappingLine, idx) => {
    return mappingLine.map((mappingTile) => {
      return board[idx].findIndex((tile) => tile === mappingTile) >= 0;
    });
  });
  return mappingResult;
};
