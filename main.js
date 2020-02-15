document.addEventListener("DOMContentLoaded", async () => {

    let board = new Board(document.getElementById('board'), onSquareClicked);
    let ai = new GameAI(board);

    let currentPlayer = "human";
    let unoccupied = [];
    let humanMoves = [];

    function onSquareClicked(y, x){
        return function(event){
            let square = board.getSquare(y, x);

            if(square.isOccupied()){
                return;
            }

            // unoccupied = unoccupied.filter(n => n !== (20*y + x));
            humanMoves.push(new Square(y, x));

            square.setVal(1);
            square.getDomObj().classList.add('orange');

            makeCpuMove();

            let winner = gameIsOver();

            if(!!winner){
                console.log('game over. %s is the winner', (winner === 1) ? 'human' : 'cpu');
            }
        };
    }

    // make a random move adjascent to human
    async function makeCpuMove(){
        let {row, col} = ai.getNextMove(board.getOccupiedSquares());
        let square = board.getSquare(row, col);
        square.onCpuSelect();
    }

    // return 1 or -1 if game is over, 0 for not over
    function gameIsOver(){
        let tempBoard = board.getRawMatrix();

        // check rows
        for(let i=0; i<tempBoard.length; i++){
            let result = checkRow(tempBoard[i]);

            if(!!result){
                return result;
            }
        }

        // check columns
        for(let i=0; i<tempBoard[0].length; i++){
            let column = tempBoard.reduce((a, c) => {
                a.push(c[i]);
                return a;
            }, []);

            let result = checkRow(column);
            if(!!result){
                return result;
            }
        }

        // check diagonals
        let len = tempBoard.length;
        for(let i=4; i<20; i++){
            let diagonal1 = [];
            let diagonal2 = [];
            let diagonal3 = [];
            let diagonal4 = [];

            for(let j=0; j<=i; j++){
                diagonal1.push(tempBoard[i-j][j]);
                diagonal2.push(tempBoard[len - 1 - j][len - 1 - i - j]);
                diagonal3.push(tempBoard[j][len - 1 - i + j]);
                diagonal4.push(tempBoard[len - 1 - i + j][j]);
            }

            let result = checkRow(diagonal1);
            if(!!result){
                return result;
            }

            result = checkRow(diagonal2);
            if(!!result){
                return result;
            }

            result = checkRow(diagonal3);
            if(!!result){
                return result;
            }

            result = checkRow(diagonal4);
            if(!!result){
                return result;
            }
        }

        return 0;

        function checkRow(row){
            let streak = 0;
            let currentPlayer = 0;

            for(let i=0; i<row.length; i++){
                if(!!row[i]){
                    if(row[i] === currentPlayer){
                        streak++;
                    } else {
                        streak = 1;
                        currentPlayer = row[i];
                    }
                } else {
                    streak = 0;
                    currentPlayer = 0;
                }

                if(streak === 5){
                    return currentPlayer;
                }
            }

            return 0;
        }
    }
});
