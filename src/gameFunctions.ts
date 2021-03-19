import {
  Game,
  Table,
  Dish,
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
  const dishes = mapTimes(makeRandomDish,5)
  return { dishes, center };
};

export const makeRandomDish = (): Dish => {
  const tiles: Tile[] = ["sun", "moon", "snow", "leaf", "dream"];
  const dish = mapTimes(() => {
    // 0~4の乱数を生成
    const random = Math.floor(Math.random() * 5);
    return tiles[random];
  }, 4);
  return dish;
};

export const lineCheck = (
  game: Game,
  selectedLine: SelectedLine,
  selectedTileType: Tile
): boolean => {
  const isAnotherPlayer = selectedLine.playerIdx !== game.nowPlaying;
  if (isAnotherPlayer) {
    console.log("Error anotherPlayer");
    return false;
  }
  const player = game.players[selectedLine.playerIdx];
  // lineIdxが-1のときはoverを選択したとき
  const isSelectOver = selectedLine.lineIdx < 0
  if(!isSelectOver){
    const targetLine = player.work[selectedLine.lineIdx];
    const emptyLine = targetLine.length === 0;
    const sameTileLine =
      !emptyLine && player.work[selectedLine.lineIdx][0] === selectedTileType;
    const mappingBoard = makeMappingBoard()
    const sameLineBoard = mappingBoard[selectedLine.lineIdx];
    const mappingIndex = sameLineBoard.indexOf(selectedTileType);
    const boardExistSameTile = player.board[selectedLine.lineIdx][mappingIndex];
    if(selectedTileType === 'first'){
      console.log("Error first cannot insert work")
      return false;
    }
    if (!emptyLine && !sameTileLine && !isSelectOver) {
      console.log("Error anotherTile exist on this line");
      return false;
    }
    if (boardExistSameTile) {
      console.log("Error SameTile exist on board");
      return false;
    }
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
  const targetDish = isSelectCenter
    ? game.table.center
    : game.table.dishes[selectedTile.tableIdx];
  const targetTileType = targetDish[selectedTile.tileIdx];
  const isSelectOver = selectedLine.lineIdx < 0;
  const targetWorkLine = isSelectOver
    ? targetPlayer.over
    : targetPlayer.work[selectedLine.lineIdx];
  const isSelectFirst = targetTileType === 'first';

  // playerの更新
  // テーブルの真ん中からタイルを選択したときに、1stタイルがあればOverに入れる
  const isGetFirst = !isSelectFirst && isSelectCenter && targetDish.indexOf("first") >= 0;
  if (isGetFirst) targetPlayer.over.push("first");
  // 選択したタイルが同じ皿に何枚あるかをカウント
  const countSameTileReducer = (cnt: number, tile: Tile): number => tile === targetTileType ? cnt + 1 : cnt;
  const countSameTileInTargetDish = targetDish.reduce(countSameTileReducer, 0);
  // Workのキャパシティを超えないように上記の枚数を加える
  const targetWorkCapacity = isSelectOver ? 99 : selectedLine.lineIdx + 1 - targetWorkLine.length;
  const OverWorkCapacity = targetWorkCapacity < countSameTileInTargetDish
  const addWorkTilesCount = OverWorkCapacity ? targetWorkCapacity : countSameTileInTargetDish;
  roopTimes(() => targetWorkLine.push(targetTileType), addWorkTilesCount);
  // 選択したWorkのキャパシティを超える分は、Overに入れる
  const addOverTilesCount = OverWorkCapacity ? countSameTileInTargetDish - targetWorkCapacity : 0;
  const addOverTiles = mapTimes(() => targetTileType, addOverTilesCount);
  targetPlayer.over.push(...addOverTiles);

  // Tableの更新
  // テーブルの真ん中からタイルを選択したときは、選択したタイルと1stタイルを取り除く
  if (isSelectCenter) {
    const newCenter = targetDish.filter(
      (tile) => tile !== targetTileType && tile !== "first"
    );
    game.table.center = newCenter;
  // 皿からタイルを取得したときは、違う種類のタイルは真ん中に移動し、皿ごと取り除く
  } else {
    const addCenter = targetDish.filter((tile) => tile !== targetTileType);
    game.table.center.push(...addCenter);
    game.table.dishes.splice(selectedTile.tableIdx, 1);
  }

  // 操作ターンのプレイヤーの更新
  const newNowPlaying = nextPlayer(game.players, game.nowPlaying);

  // テーブルのタイルがなくなったときの処理（フェイズ終了）
  if (game.table.dishes.length === 0 && game.table.center.length === 0) {
    const newTable = makeRandomTable();
    const nextNowPlaying = game.players.findIndex(
      (player) => player.over.indexOf("first") > -1
    );
    const newPlayers = game.players.map((player) => {
      return playerCalc(player);
    });

    // Todo ゲームクリア判定
    const playerClearCheck = (players: Player[]): boolean => {
      players.forEach(player => {
        player.board.forEach(line => {
          let isCompleteLine = true
          line.forEach(tile => {
            if (isCompleteLine) {
              isCompleteLine = tile
            }
          })
          if (isCompleteLine) {
            return true
          }
        })
      })
      return false
    }

    const isClear = playerClearCheck(game.players)
    if (isClear) {
      // Todo ゲーム終了時の得点計算
      game.players.forEach(player => {
        const additionalPoint = additionalPointCalc(player.board);
        player.point += additionalPoint;
      })

      // Todo 勝敗判定、勝敗表示？
      
    }
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
  moveTileFromWorkToBoard(player.board,player.work);
  const plusPoint = plusPointsCalc(oldBoard, player.board);
  const mainusPoint = mainusPointsCalc(player.over.length);
  console.log({plusPoint,mainusPoint})
  const playerPoint = player.point + plusPoint - mainusPoint;
  return {
    point: playerPoint,
    board: player.board,
    work: player.work,
    over: [],
  };
};

const additionalPointCalc = (board: boolean[][]): number => {
  let point = 0;
  // 横一列が揃っていたら+2点
  board.forEach((line => {
    let check = true
    line.forEach(tile => {
      if (check) check = tile
    })
    if (check) point += 2
  }));
  // 縦一列が揃っていたら+7点
  [...Array(5)].forEach((_, idx) => {
    let check = true
    board.forEach(line => {
      if (check) check = line[idx]
    })
    if (check) point += 7
  });
  // 同じ色が５枚揃っていたら+10点
  [...Array(5)].forEach((_, tileIdx) => {
    let check = true
    board.forEach((line, lineIdx) => {
      // 斜めに検索していくために、タイルの場所にラインの値を足して5で割る
      const idx = (tileIdx + lineIdx) % 5
      if (check) check = line[idx]
    })
    if (check) point += 10
  });
  return point;
}

const moveTileFromWorkToBoard = (board: boolean[][], work: Line[]): void => {
  const mappingBoard = makeMappingBoard()
  work.forEach((line,lineIdx)=>{
    if (line.length > lineIdx) {
      const targetLineOnBoard = mappingBoard[lineIdx]
      const tileIdxOnBoard = targetLineOnBoard.indexOf(line[0])
      board[lineIdx].splice(tileIdxOnBoard,1,true)
      work.splice(lineIdx,1,[])
    }
  })
}

const plusPointsCalc = (oldBoard: boolean[][], newBoard: boolean[][]): number => {
  // Todo add ボードを比較して加算される点数を計算する処理
  console.log('oldboard : ',oldBoard)
  console.log('newboard : ',newBoard)

  let plusPoint = 0
  const addPoints = (y:number,x:number):void=>{
    plusPoint += 1
    plusPoint += searchUp(newBoard,x,y)
    plusPoint += searchDown(oldBoard,x,y)
    plusPoint += searchLeft(newBoard,x,y)
    plusPoint += searchRight(oldBoard,x,y)
  }
  const searchUp = (board:boolean[][],x:number,y:number):number => {
    let point = 0;
    y--
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
  y++
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
  x--
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
  x++
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
      if(oldBoard[lineIdx][tileIdx] !== isTile) addPoints(lineIdx,tileIdx)
    })
});
  return plusPoint;
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
