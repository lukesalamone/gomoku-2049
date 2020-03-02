/****
    *   GameAI class
    *
    *   Simple implementation of minimax algorithm to determine best move to
    *   play.
    *
    *   Execute a WebWorker to prevent freezing the main UI.
*/
let totalCalcs = 0;

class GameAI {
    constructor(board){
        this.board = board;
    }

    getNextMove(){
        return new Promise((resolve, reject) => {

            let matrix = this.board.getRawMatrix();
            let worker = new Worker('worker.js');

            worker.onmessage = event => {
                if(!event.data){
                    reject('could not calculate move');
                }

                switch(event.data.type){
                    case 'move':
                        let [y, x] = event.data.val;
                        resolve([y, x]);
                        worker.terminate();
                        break;
                    case 'progress':
                        // todo
                        break;
                    case 'console':
                        // todo add console messages to sidebar
                        break;
                    case 'debug':
                        // debug events
                        break;
                }
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
