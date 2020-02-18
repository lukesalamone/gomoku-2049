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
    }

    getNextMove(humanMoves){
        let matrix = this.board.getRawMatrix();
        let score = staticEval(matrix);

        return getRandomAdjacent(humanMoves);
    }

}

function getRandomAdjacent(moves){
    let set = moves.reduce((a, c) => {
        let s = c.getSurrounding().map(m => {
            return [m.row, m.col];
        });

        return new Set([...a, ...s]);
    }, new Set());

    let index = Math.floor(Math.random() * set.size);

    return [...set][index];
}

function staticEval(matrix){
    let a = horizontalScore(matrix);
    let b = verticalScore(matrix);
    let c = diagonalScore(matrix);

    console.log('SCORES horizontal: %s, vertical: %s, diagonal: %s', a, b, c);

    return a + b + c;
}

// perform static analysis on the rows of the board
function horizontalScore(matrix){
    let score = 0;

    for(let i=0; i<matrix.length; i++){
        let current = 0;
        let streak = 0;

        for(let j=0; j<matrix[i].length; j++){
            ({current, streak, score} = scoreConsecutive(matrix[i][j], current, streak, score));
        }

        if(current !== 0){
            score += current * adjacentBlockScore(consecutive);
        }
    }

    return -1 * score;
}

// static analysis on columns
function verticalScore(matrix){
    let score = 0;

    for(let i=0; i<matrix.length; i++){
        let current = 0;
        let streak = 0;

        for(let j=0; j<matrix[i].length; j++){
            ({current, streak, score} = scoreConsecutive(matrix[j][i], current, streak, score));
        }

        if(current !== 0){
            score += current * adjacentBlockScore(streak);
        }
    }

    return -1 * score;
}

// static analysis on diagonals
function diagonalScore(matrix){
    return 0;

    let len = matrix.length, diagonal1 = [], diagonal2 = [],
            diagonal3 = [], diagonal4 = [];

    for(let i=4; i<len; i++){
        for(let j=0; j<len; j++){
            diagonal1.push(matrix[i-j][j]);
            diagonal2.push(matrix[len - 1 - j][len - 1 - i - j]);
            diagonal3.push(matrix[j][len - 1 - i + j]);
            diagonal4.push(matrix[len - 1 - i + j][j]);
        }
    }

    return rowScore(diagonal1) + rowScore(diagonal2)
        + rowScore(diagonal3) + rowScore(diagonal4);

    // score a row for consecutive blocks
    function rowScore(row){
        let current = 0, streak = 0, score = 0;
        for(let i=0; i<row.length; i++){
            ({current, streak, score} = scoreConsecutive(row[i], current, streak, score));
        }

        if(current !== 0){
            score += current * adjacentBlockScore(consecutive);
        }

        return -1 * score;
    }
}

// score a consecutive group of blocks
function scoreConsecutive(block, current, streak, score){
    if(block !== current){
        if(current === 0){
            current = block;
            consecutive = 1;
        } else {
            score += current * adjacentBlockScore(consecutive);
            current = block;
            consecutive = 1;
        }
    } else {
        if(block !== 0) consecutive++;
    }

    return {
        'current': current,
        'streak': streak,
        'score': score
    };
}

function rowIsEmpty(row){
    for(let i=0; i<row.length; i++){
        if(row[i] !== 0) return false;
    }

    return true;
}

/** *
    * score a consecutive group of blocks
    *   count:  number in a row
    *
*/
function adjacentBlockScore(count){
    const scoreMatrix = [0, 2, 4, 8, 16, 32];

    try {
        return scoreMatrix[count];
    } catch(e){
        return -1;
    }
}
