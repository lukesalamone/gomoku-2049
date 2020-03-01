const SIZE = 20;

class Board{
    constructor(parentNode, onSquareClickedCb) {
        this.matrix = [];
        this.parentNode = parentNode;

        // generate board
        for(let i=0; i<SIZE; i++){
            let r = [];
            let row = document.createElement("div");
            row.classList.add('row');
            row.classList.add(i);

            for(let j=0; j<SIZE; j++){
                let square = new Square(i, j);
                square.setOnClick(onSquareClickedCb(i, j));
                row.appendChild(square.getDomObj());
                r.push(square);
            }

            parentNode.appendChild(row);
            this.matrix.push(r);
        }
    }

    getSize(){
        return SIZE;
    }

    getOccupiedSquares(){
        return this.matrix.reduce((arr, row) => {
            arr.push(...row.filter(square => square.isOccupied()));
            return arr;
        }, []);
    }

    getSquare(row, col) {
        try {
            return this.matrix[row][col];
        } catch(e){
            console.log(e);
        }
    }

    // return array of rows of Squares
    getMatrix(){
        return this.matrix;
    }

    // return array of rows of raw values
    getRawMatrix(){
        return this.matrix.reduce((arr, row) => {

            // for each row, reduce to raw values
            row = row.reduce((a, c) => {
                a.push(c.getVal())
                return a;
            }, []);

            arr.push(row);
            return arr;
        }, []);
    }

    getRow(num){
        return this.matrix[num];
    }

    // remove empty squares that only necessary squares are evaluated
    // optional padding will be applied around played squares
    static pruneMatrix(matrix, padding){
        let left = Infinity, right = 0, top = Infinity, bottom = 0;
        const MATRIX_SIZE = 20;

        for(let i=0; i<matrix.length; i++){
            for(let j=0; j<matrix[i].length; j++){
                if(matrix[i][j]){
                    top = Math.min(top, i);
                    bottom = Math.max(bottom, i);
                    left = Math.min(left, j);
                    right = Math.max(right, j);
                }
            }
        }

        if(padding){
            left = Math.max(0, left - padding);
            right = Math.min(MATRIX_SIZE, right + padding);
            top = Math.max(0, top - padding);
            bottom = Math.min(MATRIX_SIZE, bottom + padding);
        }

        // always return square matrix
        // left: 0, right: 10, top: 0, bottom: 8
        if((right-left) - (bottom-top)){
            console.log('normalizing pruned size');
            console.log('left: %s, right: %s, top: %s, bottom: %s', left, right, top, bottom);

            let width = right - left;
            let height = bottom - top;
            let size = Math.max(width, height);

            if(width !== size){
                // add half to left and right
                let x = size - width;
                left = Math.max(0, left - Math.floor(x/2));
                right = Math.min(19, right + Math.floor(x/2));
                x = size - (right - left);

                if(x){
                    if(left){
                        left -= x;
                    } else {
                        right += x;
                    }
                }
            } else if(height !== size){
                let x = size - height;
                top = Math.max(0, top - Math.floor(x/2));
                bottom = Math.min(19, bottom + Math.floor(x/2));
                x = size - (bottom - top);

                if(x){
                    if(top){
                        top -= x;
                    } else {
                        bottom += x;
                    }
                }
            }

            // check results
            if((bottom-top) !== (right-left)){
                console.log('error!! unequal sizes!!!')
            }
        }

        let copy = [];

        for(let i=top; i<=bottom; i++){
            let row = [];

            for(let j=left; j<=right; j++){
                row.push(matrix[i][j]);
            }

            copy.push(row);
        }

        return {
            'matrix': copy,
            'off': {
                'x': left,
                'y': top
            }
        };
    }

    // return 1 if human wins, -1 if AI wins, 0 for no winner
    static checkWinner(matrix){
        for(let i=0; i<matrix.length; i++){
            let res = {hor:{}, ver:{}, dg1:{}, dg2:{}, dg3:{}, dg4:{}};

            // build results obj
            for(let key in res){
                res[key] = {streak:0, current:0};
            }

            for(let j=0; j<matrix[i].length; j++){
                // check horizontals
                let winner = check(matrix[i][j], res.hor);
                if(winner) return winner;

                // check verticals
                winner = check(matrix[j][i], res.ver);
                if(winner) return winner;

                // check all four diagonals
                if(i < 4 || j > i) continue;

                let len = matrix.length;
                winner = check(matrix[i-j][j], res.dg1);
                if(winner) return winner;

                winner = check(matrix[len-1-j][i-j], res.dg2);
                if(winner) return winner;

                winner = check(matrix[j][len-1-i+j], res.dg3);
                if(winner) return winner;

                winner = check(matrix[len-1-i+j][len-1-j], res.dg4);
                if(winner) return winner;
            }// end inner for loop
        }// end outer for loop

        return 0;

        function check(square, obj){
            if(!!square){
                if(square === obj.current){
                    obj.streak++;
                } else {
                    obj.streak = 1;
                    obj.current = square;
                }
            } else {
                obj.streak = 0;
                obj.current = 0;
            }

            if(obj.streak === 5){
                // a player has won
                return obj.current;
            } else {
                // no player has won
                return 0;
            }
        }

        function highlight(a, b){
            board.getSquare(a, b).twinkle();
        }
    }

    showAnimation(){
        return new Promise(async (resolve, reject) => {
            // twinkle board
            let boardSize = board.getSize();

            // create list of numbers from 0 -> square of board size
            let squareList = Array.from({
                length: boardSize * boardSize
            }, (k,v) => v);

            // shuffle list
            squareList.sort(() => Math.random() - 0.5);

            for(let i=0; i<squareList.length; i+=10){
                let promises = Array.from({length: 10}, (k,v)=>v);
                promises = promises.map(a => {
                    let num = squareList[i+a];
                    let x = num % boardSize, y = Math.floor(num / boardSize);
                    return board.getSquare(y, x).twinkle();
                });

                // twinkle square
                await Promise.all(promises);
            }

            // shuffle list again
            squareList.sort(() => Math.random() - 0.5);

            for(let i=squareList.length-1; i>0; i-=10){
                let promises = Array.from({length: 10}, (k,v)=>v);
                promises = promises.map(a => {
                    let num = squareList[i-a];
                    let x = num % boardSize, y = Math.floor(num / boardSize);
                    return board.getSquare(y, x).untwinkle();
                });

                // untwinkle squares
                await Promise.all(promises);
            }

            resolve();
        });
    }

    delete(){
        this.parentNode.innerHTML = '';
    }
}
