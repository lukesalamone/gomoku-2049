let board = null;
let ai = null;
let animating = false;
let thinking = false;

document.addEventListener("DOMContentLoaded", async () => {

    document.querySelector('#about').onclick = openAbout;
    document.querySelector('.overlay .close').onclick = closeAbout;
    document.querySelector('#play-again').onclick = onNewGameClicked;
    document.addEventListener('progress', e => {
        let percent = e.detail;

        if(!percent){
            document.querySelector('#progress').classList.remove('slide');
        } else {
            document.querySelector('#progress').classList.add('slide');
        }

        document.querySelector('#progress').style.width = percent + '%';
    });

    fetch('timestamp').then(response => {
        return response.json();
    }).then(data => {
        let str = new Date(data).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'numeric', year: 'numeric'
                    }).replace(/\//g, '-');
        document.querySelector('#timestamp').textContent = str;
    });

    resetGame();
});

function onSquareClicked(y, x){
    return async function(event){
        if(animating || document.querySelector('#board').classList.contains('thinking')){
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

        document.querySelector('#board').classList.add('thinking');
        document.dispatchEvent(new CustomEvent("progress", {"detail": 0}));

        // make cpu move
        let [row, col] = await ai.getNextMove(board.getOccupiedSquares());

        document.querySelector('#board').classList.remove('thinking');

        square = board.getSquare(row, col);
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
