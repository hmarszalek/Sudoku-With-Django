import { selectTile, selectNumber } from "./gameplay.js";
import { isOnSolveSudoku, isOnHistory } from "./script.js";

const isMobile = window.screen.width <= 768;
const BOARD_SIZE = 9;


export function prepareBoard(boardName, deafultBoard, deafultSolution) {
    if (isOnSolveSudoku) {
        prepareDigits();
    }

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
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile", "prevent-text-select")

            if (isOnHistory) {
                tile.innerText = deafultSolution[r][c];
                if(deafultBoard[r][c] != 0) {
                    tile.classList.add("start-tile");
                }
            }

            document.getElementById(boardName).appendChild(tile);
        }
    }

    if (isOnSolveSudoku) {
        prepareSolution();
    }

    if (isMobile && isOnSolveSudoku) {
        // Move the special element to the end of the board
        const special = document.getElementById("special");
        const sudokuBoard = document.getElementById("sudoku-board");
        const pauseScreen = document.getElementById("pause-screen");

        if (special && sudokuBoard && pauseScreen) {
            sudokuBoard.insertBefore(special, pauseScreen.nextSibling);
        }
    }
}

function prepareDigits() {
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", function() { selectNumber(i.toString()); });
        number.classList.add("number", "prevent-text-select");
        document.getElementById("numbers").appendChild(number);
    }
}

function prepareSolution() {
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.createElement("div");
            tile.id = "s" + r.toString() + ":" + c.toString();
            if(r == 2 || r == 5) {
                tile.style.borderBottom = "2px solid black";
            }
            if(c == 2 || c == 5) {
                tile.style.borderRight = "2px solid black";
            }
            tile.classList.add("tile", "prevent-text-select");
            document.getElementById("solution").appendChild(tile);
        }
    }
}