let cache = new Map();


onmessage = event => {
    this.checkWinner = new Function(event.data.fn.args, event.data.fn.body);
    let move = bestMove(event.data.matrix);
    cache = new Map();
    postMessage(move);
}

function bestMove(matrix){
    let bestScore = -Infinity;
    let move;

    let squares = getSquaresToCheck(matrix);

    for(let i=0; i<squares.length; i++){
        let [x, y] = squares[i];
        matrix[x][y] = -1;
        let score = minimax(matrix, 0, false);

        if(score > bestScore){
            bestScore = score;
            move = [x, y];
        }
    }

    return move;
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

function minimax(matrix, depth, isAiTurn){
    if(checkCache(arguments) !== false){
        return checkCache(arguments);
    }

    let winner = this.checkWinner(matrix);
    if(winner){
        // return 9999 if ai wins, -9999 if human wins
        putCache(arguments, -9999 * winner);

        return -9999 * winner;
    }

    // stop at depth 2
    if(depth >= 2){
        let eval = staticEval(matrix);

        putCache(arguments, eval);
        return eval;
    }

    // if AI's turn, we want to maximize score
    let bestScore = isAiTurn ? -Infinity : Infinity;

    let squares = getSquaresToCheck(matrix);
    for(let i=0; i<squares.length; i++){
        let [x, y] = squares[i];
        matrix[x][y] = (isAiTurn ? -1 : 1);

        let score = minimax(matrix, depth+1, !isAiTurn);
        matrix[x][y] = 0;
        bestScore = isAiTurn ? Math.max(score, bestScore) : Math.min(score, bestScore);
    }

    putCache(arguments, bestScore);
    return bestScore;

    function checkCache(args){
        let [a, b, c] = args;
        a = JSON.stringify(a);

        if(cache.has(a) && cache.get(a).has(b) && cache.get(a).get(b).has(c)){
            return cache.get(a).get(b).get(c);
        } else {
            return false;
        }
    }

    function putCache(args, result){
        if(typeof result !== 'number' || isNaN(result)){
            return;
        }

        let [a, b, c] = args;
        a = JSON.stringify(a);

        if(!cache.has(a)){
            cache.set(a, new Map());
            cache.get(a).set(b, new Map());
            cache.get(a).get(b).set(c, result);
            return;
        }

        if(!cache.get(a).has(b)){
            cache.get(a).set(b, new Map());
            cache.get(a).get(b).set(c, result);
            return;
        }

        if(!cache.get(a).get(b).has(c)){
            cache.get(a).get(b).set(c, result);
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
