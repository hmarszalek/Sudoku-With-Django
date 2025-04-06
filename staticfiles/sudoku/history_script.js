var solution;
var board;
var sname;

var BOARD_SIZE = 9;
var BOX_SIZE = 3;

window.onload = function() {
    document.querySelectorAll('.history-sudoku').forEach(function(container) {
        sname = container.getAttribute('data-name');
        board = JSON.parse(container.getAttribute('data-board'));
        solution = JSON.parse(container.getAttribute('data-solution'));
        console.log(sname);
        prepareBoard();
    });
}

function prepareBoard() {
    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + ":" + c.toString();

            if(r == 2 || r == 5) {
                tile.style.borderBottom = "2px solid black";
            }
            if(c == 2 || c == 5) {
                tile.style.borderRight = "2px solid black";
            }
            
            tile.classList.remove("start-tile");
            tile.classList.add("tile", "prevent-text-select");
            tile.innerText = solution[r][c];
            if(board[r][c] != 0) {
                tile.classList.add("start-tile");
            }
            document.getElementById("board" + sname).appendChild(tile);
        }
    }

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.getElementById(r.toString() + ":" + c.toString());
            tile.innerHTML = "";
            tile.classList.remove("start-tile");
            tile.innerText = solution[r][c];
            if(board[r][c] != 0) {
                tile.classList.add("start-tile");
            }
        }
    }
}
