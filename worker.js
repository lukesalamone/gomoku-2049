let cacheHits = 0;
let cacheMisses = 0;
let movesPlayed = 0;
const MAX_DEPTH = 3;

onmessage = event => {
    this.checkWinner = new Function(event.data.fn.args, event.data.fn.body);
    this.cache = new Map();
    bestMove(event.data.matrix);

    console.log('CACHE hits: %s, misses: %s', cacheHits, cacheMisses);

    sendMove(this.move);
}

function bestMove(matrix){
    let bestScore = -Infinity;

    let squares = getSquaresToCheck(matrix);

    for(let i=0; i<squares.length; i++){
        let [y, x] = squares[i];
        matrix[y][x] = -1;
        let score = alphabeta(matrix, 0, -Infinity, Infinity, false);
        matrix[y][x] = 0;

        console.log('%s evaluated to %s', JSON.stringify([y, x]), score);

        if(score > bestScore){
            bestScore = score;
            this.move = [y, x];
        }
    }

    return move;
}

function alphabeta(matrix, depth, alpha, beta, isAiTurn){
    if(checkCache(matrix) !== false){
        return checkCache(matrix);
    }

    let winner = this.checkWinner(matrix);
    if(winner){
        putCache(matrix, -9999*winner);

        return -9999 * winner;
    }

    // stop at MAX_DEPTH
    if(depth >= MAX_DEPTH){
        let eval = staticEval(matrix);
        return eval;
    }

    // if AI's turn, we want to maximize score
    let best = isAiTurn ? -Infinity : Infinity;
    let squares = getSquaresToCheck(matrix);

    for(let i=0; i<squares.length; i++){
        let [y, x] = squares[i];
        matrix[y][x] = (isAiTurn ? -1 : 1);

        let score = alphabeta(matrix, depth+1, alpha, beta, !isAiTurn);
        best = isAiTurn ? Math.max(score, best) : Math.min(score, best);

        if(isAiTurn){
            alpha = Math.max(alpha, best);
        } else {
            beta = Math.min(beta, best);
        }

        matrix[y][x] = 0;

        if(alpha >= beta){
            // console.log('alpha beta pruned at %s', JSON.stringify([y, x]));
            break;
        }
    }

    putCache(matrix, best);
    return best;
}

function getSquaresToCheck(matrix){
    let list = [];

    for(let i=0; i<matrix.length; i++){
        for(let j=0; j<matrix[i].length; j++){
            if(!matrix[i][j] && isTouchingOccupied(i, j)){
                list.push([i, j]);
            }
        }
    }

    return list;

    function isTouchingOccupied(i, j){
        return (occupied(i+1, j) || occupied(i-1, j) || occupied(i, j+1)
            || occupied(i, j-1) || occupied(i+1, j+1) || occupied(i-1, j+1)
            || occupied(i-1, j-1) || occupied(i+1, j-1));

        function occupied(x, y){
            try {
                return matrix[x][y];
            } catch(e){
                return false;
            }
        }
    }
}

function staticEval(matrix){
    let a = horizontalScore(matrix) || 0;
    let b = verticalScore(matrix) || 0;
    let c = diagonalScore(matrix) || 0;

    return a + b + c;

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

        for(let i=0; i<matrix[0].length; i++){
            let current = 0;
            let streak = 0;

            for(let j=0; j<matrix.length; j++){
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

        return -1 * score;

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
}

// enhance cache by excluding depth and turn as keys
// since both will be the same for a given matrix key
function checkCache(matrix){
    matrix = matrix.toString();

    if(this.cache.has(matrix)){
        cacheHits++;
        return this.cache.get(matrix);
    } else {
        cacheMisses++;
        return false;
    }
}

function putCache(matrix, result){
    if(typeof result !== 'number' || isNaN(result)){
        console.error('cannot put "%s" in cache', result);
        return;
    }

    this.cache.set(matrix.toString(), result);
}

function sendMove(move){
    postMessage({
        type: 'move',
        val: move
    });
}

function sendDebug(message){
    postMessage({
        type: 'debug',
        val: message
    });
}
