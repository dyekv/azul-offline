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

export const deepCopyAoa = <T>(aoa:T[][]):T[][] => {
  return aoa.map(array => [...array])
}

export const makeRandomGroup = (): Group => {
  const tiles = ["sun", "moon", "snow", "leaf", "dream"];
  const group = [...Array(4)].map(() => {
    // 0~4の乱数を生成
    const random = Math.floor(Math.random() * 5);
    return tiles[random] as Tile;
  });
  return group;
};

const makeInitializedPlayer = (countPlayer: number): Player[] => {
  return [...Array(countPlayer)].map(() => {
    return {
      work: [...Array(5)].map(() => []),
      board: [...Array(5)].map(() => [false,false,false,false,false]),
      over: [],
      point: 0,
    };
  });
};

export const makeRandomTable = (): Table => {
  const center: Tile[] = ["first"];
  const groups = [...Array(5)].map(() => {
    return makeRandomGroup();
  });
  return { groups, center };
};

export const initializedGame = (): Game => {
  return {
    players: makeInitializedPlayer(2),
    table: makeRandomTable(),
    nowPlaying: 0,
  };
};

export const lineCheck = (
  game: Game,
  selectedLine: SelectedLine,
  tile: Tile
): boolean => {
  const anotherPlayer = selectedLine.playerIdx !== game.nowPlaying;
  if (anotherPlayer) {
    console.log("anotherPlayer");
    return false;
  }
  const player = game.players[selectedLine.playerIdx];
  const emptyLine = player.work[selectedLine.lineIdx].length === 0;
  const sameTileLine =
    !emptyLine && player.work[selectedLine.lineIdx][0] === tile;
  const mappingBoard = makeMappingBoard()
  const sameLineBoard = mappingBoard[selectedLine.lineIdx];
  const mappingIndex = sameLineBoard.indexOf(tile);
  const boardExistSameTile = player.board[selectedLine.lineIdx][mappingIndex];
  if (!emptyLine && !sameTileLine) {
    console.log("!emptyLine && !sameTileLine");
    return false;
  }
  if (boardExistSameTile) {
    console.log("boardExistSameTile");
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

export const gameStep = (
  game: Game,
  selectedTile: SelectedTile,
  selectedLine: SelectedLine
): Game => {
  const targetPlayer = game.players[selectedLine.playerIdx];
  const isSelectCenter = selectedTile.tableIdx < 0;
  const targetGroup = isSelectCenter
    ? game.table.center
    : game.table.groups[selectedTile.tableIdx];
  const targetTileType = targetGroup[selectedTile.tileIdx];
  const targetWorkLine = targetPlayer.work[selectedLine.lineIdx];

  // playerの更新
  const countSameTile = targetGroup.reduce(
    (cnt, tile) => (tile === targetTileType ? cnt + 1 : cnt),
    0
  );
  const targetWorkCapacity = selectedLine.lineIdx + 1 - targetWorkLine.length;
  const addWorkTilesCount =
    targetWorkCapacity >= countSameTile ? countSameTile : targetWorkCapacity;
  const addWorkTiles = [...Array(addWorkTilesCount)].map(() => targetTileType);
  targetPlayer.work[selectedLine.lineIdx].push(...addWorkTiles);

  const isGetFirst = isSelectCenter && targetGroup.indexOf("first") >= 0;
  if (isGetFirst) {
    targetPlayer.over.push("first");
  }
  const addOverTilesCount =
    targetWorkCapacity >= countSameTile
      ? 0
      : countSameTile - targetWorkCapacity;
  const addOverTiles = [...Array(addOverTilesCount)].map(() => targetTileType);
  targetPlayer.over.push(...addOverTiles);

  // Tableの更新
  if (isSelectCenter) {
    const newCenter = targetGroup.filter(
      (tile) => tile !== targetTileType && tile !== "first"
    );
    game.table.center = newCenter;
  } else {
    const addCenter = targetGroup.filter((tile) => tile !== targetTileType);
    game.table.center.push(...addCenter);
    game.table.groups.splice(selectedTile.tableIdx, 1);
  }

  // 操作ターンのプレイヤーの更新
  const newNowPlaying = nextPlayer(game.players, game.nowPlaying);

  // Todo 全部のgroupがなくなったときの処理
  if (game.table.groups.length === 0 && game.table.center.length === 0) {
    // Todo テーブルをリセットする
    const newTable = makeRandomTable();
    // Todo 次の最初にタイルを取る人を設定（nowPlayingを上書き？）
    const nextNowPlaying = game.players.findIndex(
      (player) => player.over.indexOf("first") > -1
    );
    const newPlayers = game.players.map((player) => {
      return playerCalc(player);
    });
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
  [...Array(tileCount)].forEach((_, idx) => {
    if (idx < mainusPointsArray.length) {
      mainusPoint += mainusPointsArray[idx];
    } else {
      mainusPoint += 3;
    }
  });
  return mainusPoint;
};

export const makeMappingBoard = (): Line[] => {
  const tiles = ["sun", "moon", "snow", "leaf", "dream"] as Line;
  const tileMapping = (lineIdx: number): Tile[] => {
    return [...Array(5)].map((_, idx) => {
      const mappingIdx = (idx + lineIdx) % 5;
      return tiles[mappingIdx];
    });
  };
  const mapping = [...Array(5)].map((_, idx) => tileMapping(idx));
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
