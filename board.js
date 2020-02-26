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

        // return this.matrix[row][col];
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
        let left = 0, right = 0, top = 0, bottom = 0;

        for(let i=0; i<matrix.length; i++){
            for(let j=0; j<matrix[i].length; j++){
                if(matrix[i][j]){
                    left = Math.min(left, i);
                    right = Math.max(right, i);
                    top = Math.min(top, j);
                    bottom = math.max(bottom, j);
                }
            }
        }

        if(padding){
            left = Math.max(0, left - padding);
            right = Math.min(20, right + padding);
            top = Math.max(0, top - padding);
            bottom = Math.min(20, bottom + padding);
        }

        let copy = [];

        for(let i=left; i<right; i++){
            let row = [];

            for(let j=top; j<bottom; j++){
                row.push(matrix[i][j]);
            }

            copy.push(row);
        }

        return copy;
    }

    // return 1 or -1 if game is over, 0 for not over
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
