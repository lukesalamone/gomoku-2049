let board = null;
let ai = null;
let animating = false;

document.addEventListener("DOMContentLoaded", async () => {

    document.querySelector('#about').onclick = openAbout;
    document.querySelector('.overlay .close').onclick = closeAbout;
    document.querySelector('#play-again').onclick = onNewGameClicked;

    resetGame();
});

function onSquareClicked(y, x){
    return async function(event){
        if(animating){
            return;
        }

        let square = board.getSquare(y, x);

        if(square.isOccupied()){
            return;
        }

        // assign human to square
        square.setVal(1);
        square.getDomObj().classList.add('orange');
        let winner = Board.checkWinner(board.getRawMatrix());

        if(winner){
            console.log('game over. %s is the winner', (winner === 1) ? 'human' : 'cpu');
            onGameOver(winner);
            return;
        }

        // make cpu move
        let [row, col] = await ai.getNextMove(board.getOccupiedSquares());
        square = board.getSquare(row, col);
        await pause(500);
        square.onCpuSelect();
        winner = Board.checkWinner(board.getRawMatrix());

        if(winner){
            console.log('game over. %s is the winner', (winner === 1) ? 'human' : 'cpu');
            onGameOver(winner);
        }
    };
}

function openAbout(){
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.overlay .about').style.display = 'block';
}

function closeAbout(){
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('.overlay .about').style.display = 'none';
}

function onGameOver(winner){
    let text = `${winner > 0 ? 'human' : 'cpu' } is the winner.`;

    document.querySelector('.overlay .message').textContent = text;

    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.overlay .gameover').style.display = 'block';
}

function onNewGameClicked(){
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('.overlay .gameover').style.display = 'none';

    resetGame();
}

async function resetGame(){
    if(board){
        board.delete();
    }

    board = new Board(document.getElementById('board'), onSquareClicked);
    ai = new GameAI(board);

    animating = true;
    board.showAnimation().then(() => {
        animating = false;
    });
}

function pause(millis){
    return new Promise((resolve, reject) => {
        setTimeout(resolve, millis);
    });
}
