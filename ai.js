/****
    *   GameAI class
    *
    *   Simple implementation of minimax algorithm to determine best move to
    *   play.
    *
    *   Will need to execute a WebWorker so as to not freeze the main UI.
*/


class GameAI {
    constructor(board){
        this.board = board;
        this.winScore = 1000000;
    }

    getNextMove(humanMoves){
        return getRandomAdjacent(humanMoves);
    }

}

function getRandomAdjacent(humanMoves){
    let set = humanMoves.reduce((a, c) => {
        let s = c.getSurrounding();
        return new Set([...a, ...s]);
    }, new Set());

    let index = Math.floor(Math.random() * set.size);

    return [...set][index];
}

function horizontalScore(){

}

function verticalScore(){

}

// score a consecutive group of blocks
/**
    count:  number in a row


*/
function adjacentBlockScore(count, blocks, isAiTurn){
    const winGuaranteed = 1000000;
    if (blocks == 2 && count < 5) return 0;

    switch(count){
        case 1:
            return 1;
        case 2:
            return blocks ? 3 : (isAiTurn ? 7 : 5);
        case 3:
            return blocks ? (isAiTurn ? 10 : 5) : (isAiTurn ? 50000 : 200);
        case 4:
            return isAiTurn ? winGuaranteed : (blocks ? 200 : winGuaranteed/4);
        case 5:
            return this.winScore;
    }

    return this.winScore * 2;
}
