const SIZE = 20;

class Board{
    constructor(parentNode, onSquareClickedCb) {
        this.matrix = [];

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

    getOccupiedSquares(){
        return this.matrix.reduce((arr, row) => {
            arr.push(...row.filter(square => square.isOccupied()));
            return arr;
        }, []);
    }

    getSquare(row, col) {
        return this.matrix[row][col];
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
}
