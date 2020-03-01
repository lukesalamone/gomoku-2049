/****
    *   GameAI class
    *
    *   Simple implementation of minimax algorithm to determine best move to
    *   play.
    *
    *   Execute a WebWorker to prevent freezing the main UI.
*/
let totalCalcs = 0;
let cache = new Map();

class GameAI {
    constructor(board){
        this.board = board;
    }

    getNextMove(){
        return new Promise((resolve, reject) => {

            let matrix = this.board.getRawMatrix();
            let off = {};
            ({matrix, off} = Board.pruneMatrix(matrix, 2));

            let worker = new Worker('worker.js');

            worker.onmessage = event => {
                if(!event.data || event.data.length < 2){
                    reject('could not calculate move');
                }

                let [y, x] = event.data;

                resolve( [y+off.y, x+off.x] );
                worker.terminate();
            }

            worker.onError = error => {
                reject(error);
            }

            worker.postMessage({
                matrix: matrix,
                fn: serializedFn(Board.checkWinner)
            });
        });

        function serializedFn(fn){
            let name = fn.name;
            fn = fn.toString();

            return {
                name: name,
                args: fn.substring(fn.indexOf("(") + 1, fn.indexOf(")")),
                body: fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"))
            }
        }

    }
}
