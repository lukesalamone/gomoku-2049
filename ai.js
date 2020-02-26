/****
    *   GameAI class
    *
    *   Simple implementation of minimax algorithm to determine best move to
    *   play.
    *
    *   Execute a WebWorker to prevent freezing the main UI.
*/


class GameAI {
    constructor(board){
        this.board = board;
    }

    getNextMove(){
        let matrix = this.board.getRawMatrix();
        let score = staticEval(matrix);

        // return bestMove(matrix);
        return randomMove();
    }

}

function randomMove(){
    return [Math.floor(Math.random()*20), Math.floor(Math.random()*20)];
}

function bestMove(matrix){
    let bestScore = -Infinity;
    let move;

    for(let i=0; i<matrix.length; i++){
        for(let j=0; j<matrix[i].length; j++){
            if(!matrix[i][j]){
                matrix[i][j] = -1;
                let score = minimax(matrix, 0, true);
                matrix[i][j] = 0;

                if(score > bestScore){
                    bestScore = score;
                    move = {i, j};
                }
            }
        }
    }

    return [move.i, move.j];
}

function minimax(matrix, depth, isAiTurn){
    let winner = Board.checkWinner(matrix);
    if(winner){
        // return 64 if ai wins, -64 if human wins
        return -64 * winner;
    }

    // stop at depth 8
    if(depth === 8){
        return staticEval(matrix);
    }

    let bestScore = (isAiTurn ? -1 : 1) * Infinity;

    for (let i=0; i<3; i++) {
        for (let j=0; j<3; j++) {
            if (!matrix[i][j]) {    // if not occupied
                matrix[i][j] = (isAiTurn ? -1 : 1);
                let score = minimax(matrix, ++depth, !isAiTurn);
                matrix[i][j] = 0;
                bestScore = isAiTurn ? Math.max(score, bestScore) : Math.min(isAiTurn);
            }
        }
    }

    return bestScore;
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
            score += current * adjacentBlockScore(streak);
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
    // return 0;

    let len = matrix.length, score = 0;
    let res = {d1: {}, d2: {}, d3: {}, d4: {}};

    for(let i=4; i<len; i++){

        // set current and streak to 0 for each diagonal
        for(let key in res){
            res[key] = {streak: 0, current: 0, score: 0};
        }

        for(let j=0; j<=i; j++){
            let x = i-j;
            let y = j;
            res.d1 = process(matrix[i-j][j], res.d1);

            x = len-1-j;
            y = i-j;
            res.d2 = process(matrix[len-1-j][i-j], res.d2);

            x = j;
            y = len-1-i+j;
            res.d3 = process(matrix[j][len-1-i+j], res.d3);

            x = len-1-i;
            y = len - 1 - j;
            res.d4 = process(matrix[len-1-i+j][len-1-j], res.d4);
        }

        score += res.d1.score + res.d2.score +
            res.d3.score + res.d4.score;
    }

    return score;

    function process(block, obj){
        return scoreConsecutive(block, obj.current, obj.streak, obj.score);
    }
}

// score a consecutive group of blocks
function scoreConsecutive(block, current, streak, score){
    if(block !== current){
        if(current === 0){
            current = block;
            streak = 1;
        } else {
            score += current * adjacentBlockScore(streak);
            current = block;
            streak = 1;
        }
    } else {
        if(block !== 0) streak++;
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
