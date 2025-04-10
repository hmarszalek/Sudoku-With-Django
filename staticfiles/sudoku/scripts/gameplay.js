import { resetTimer, isGamePaused, isGameOver, toggleMenu, GameOver } from './timer.js';
import { Sudoku, digitUsage } from './sudoku.js';
import { closePopup } from './popup.js'

var board;
var difficultyLevel = 0;
export var startingBoard;
export var solution;
export var numSelected = null;
export var tileSelected = null;
export var hintCnt;
export var unfilledTiles = [];
var digitsLeft;
var isSolutionVisible = false;

const isMobile = window.screen.width <= 768;
const BOARD_SIZE = 9;

// ----------------- New Game Buttons --------------------
// Delete later
const newGameTempBtn = document.getElementById('temp'); 
if (newGameTempBtn) {
    newGameTempBtn.addEventListener('click', function() {
        difficultyLevel = 3;
        newGame(difficultyLevel);
    });
}

// New game buttons
const newGameEasyBtn = document.getElementById('easy');
if (newGameEasyBtn) {
    newGameEasyBtn.addEventListener('click', function() {
        difficultyLevel = 0;
        newGame(difficultyLevel);
    });
}

const newGameMediumBtn = document.getElementById('medium');
if (newGameMediumBtn) {
    newGameMediumBtn.addEventListener('click', function() {
        difficultyLevel = 1;
        newGame(difficultyLevel);
    });
}

// const newGameHardBtn = document.getElementById('hard');
// if (newGameHardBtn) {
//     newGameHardBtn.addEventListener('click', function() {
//         difficultyLevel = 2;
//         newGame();
//     });
// }
// -------------------------------------------------------

const newGamePopupBtn = document.getElementById('new-game-popup');
if (newGamePopupBtn) {
    newGamePopupBtn.addEventListener('click', function() {
        newGame(difficultyLevel);
    });
}

export function newGame(difficultyLevel) {
    // If popup is open, close it
    closePopup();

    // When on mobile make sure menu is closed at the beginning on new game
    if(isMobile && !document.getElementById('sudoku-container').classList.contains('resumed')) {
        toggleMenu();
        document.getElementById('sudoku-container').classList.add('resumed');
        document.getElementById('options-toggle-btn').classList.add('activated');
    }
    
    // Set removedDigits based on difficulty level
    var removedDigits = 0;
    switch(difficultyLevel) {
        case 0:
            removedDigits = Math.floor(Math.random() * 8 + 1) + 35;
            break;
        case 1:
            removedDigits = Math.floor(Math.random() * 8 + 1) + 45;
            break;
        case 2:
            removedDigits = Math.floor(Math.random() * 5 + 1) + 45;
            // newGame(Math.floor(Math.random() * 5 + 1) + 55);
            break;
        case 3:
            removedDigits = 1;
            break;
    }

    // Digit Usage
    digitUsage.fill(9);
    digitUsage[0] = 1000;

    // Generate board
    let sudoku = new Sudoku(removedDigits)
    solution = sudoku.solution;
    board = sudoku.board;
    startingBoard = sudoku.startingBoard;
    
    deselectAll();  // Deselect selected elements
    resetTimer(); // Set the game timer
    hintCnt = 0;

    updateDigitUsageClasses();

    // Unfilled tiles
    unfilledTiles = [];
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = board[r][c];
            if(board[r][c] === 0) {
                unfilledTiles.push(document.getElementById(r.toString() + ":" + c.toString()));
            }
        }
    }

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.getElementById(r.toString() + ":" + c.toString());
            tile.innerHTML = "";
            tile.classList.remove("start-tile");
            if(board[r][c] != 0) {
                tile.innerText = board[r][c];
                tile.classList.add("start-tile");
            }
        }
    }

    // Solution
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.getElementById("s" + r.toString() + ":" + c.toString());
            tile.innerText = solution[r][c];
        }
    }

    digitsLeft = removedDigits;
}

// ------------------------------------ Tile and number logic --------------------------------

export function deselectAll() {
    if(numSelected != null) {
        numSelected.classList.remove("number-selected");
        numSelected = null;
    }
    if(tileSelected != null) {
        tileSelected.classList.remove("tile-selected");
        tileSelected = null;
    }
}

export function selectNumber(numberId) {
    // console.log("selected number");
    if(isGamePaused || digitUsage[parseInt(numberId[0])] === 9) {
        return;
    }

    if(tileSelected) {
        actionChosen(numberId, tileSelected);
        tileSelected.classList.remove("tile-selected");
        tileSelected = null;
    }
    else {
        selectNewDigit(numberId);
    }
}

export function selectTile() {
    if(isGamePaused || this.classList.contains("start-tile")) {
        return;
    }

    if(numSelected) {
        actionChosen(numSelected.id, this);
    } else {
        selectNewTile(this);
    }
}

// Keyboard
document.addEventListener('keydown', function(event) {
    if(isGamePaused) {
        return;
    }
    if (parseInt(event.key) >= 1 && parseInt(event.key) <= 9) {
        selectNumber(event.key);
    }
});

function selectNewTile(tile) {
    if(tileSelected != null) {
        tileSelected.classList.remove("tile-selected");
        if(tileSelected === tile) {
            tileSelected = null;
            return;
        }
    }
    tileSelected = tile;
    tileSelected.classList.add("tile-selected");
}

function selectNewDigit(numberId) {
    if(numSelected != null) {
        numSelected.classList.remove("number-selected");
        if(numSelected.id === numberId) {
            numSelected = null;
            return;
        }
    }
    numSelected = document.getElementById(numberId);
    numSelected.classList.add('number-selected');   
}

function removeSameDigit(row, col, number, tile) {
    // console.log("remove same digit");
    if(number !== 0) {
        board[row][col] = 0;
        tile.innerText = "";
        digitsLeft++;
        digitUsage[number]--;
        
        if(unfilledTiles.indexOf(tile) === -1) {
            unfilledTiles.push(tile);
        }
    }
}

function addNewDigit(row, col, number, tile) {
    if(number === 0) {
        removeSameDigit(row, col, board[row][col], tile);
        return;
    }

    // console.log("add new digit");
    if(board[row][col] === 0) {
        digitsLeft--;
    } else {
        digitUsage[board[row][col]]--;
    }

    tile.innerText = number.toString();
    digitUsage[number]++;
    board[row][col] = number;

    if(number.toString() === solution[row][col].toString()) {
        unfilledTiles.splice(unfilledTiles.indexOf(tile), 1);
    } else if(unfilledTiles.indexOf(tile) === -1) {
        unfilledTiles.push(tile);
    }

    // Check if digitsLeft equals zero
    if(digitsLeft === 0) {
        boardFilledUp();
    }
}

function actionChosen(numberId, tile) {
    let coords = tile.id.split(":");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if(numberId === "erase-btn") {
        numberId = "0";
    }
        
    if(numberId === tile.innerText) {
        removeSameDigit(r, c, parseInt(numberId), tile);
    }
    else {
        addNewDigit(r, c, parseInt(numberId), tile);
    }

    updateDigitUsageClasses();
}

// Segregate used up digits
function updateDigitUsageClasses() {
    for (let i = 1; i <= 9; i++) {
        const numberElement = document.getElementById(i);
        // const noteElement = document.getElementById(i+"n");
        if (digitUsage[i] === 9) {
            numberElement.classList.add('number-used');
            // noteElement.classList.add('number-used');
            numberElement.classList.remove('number-selected');
            // noteElement.classList.remove('number-selected');
            if(numSelected != null && (numSelected.id === i.toString() || numSelected.id === i.toString()+"n")) {
                numSelected = null;
            }
        } else {
            numberElement.classList.remove('number-used');
            // noteElement.classList.remove('number-used');
        }
    }
}

// Maybe fix the comparison?
function boardFilledUp() {
    // const solutionNumbers = solution.map(row => row.split('').map(Number));
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== solution[i][j]) {
                console.log(`Mismatch at row ${i}, col ${j}: board=${board[i][j]}, solution=${solution[i][j]}`);
                return;
            }
        }
    }

    document.dispatchEvent(new Event('gameWon'));
    GameOver();
}


// ----------------------------------- Special Buttons ----------------------------------

    // Erase button
    const eraseButton = document.getElementById('erase-btn');
    if (eraseButton) {
        eraseButton.addEventListener("click", function() { selectNumber('erase-btn'); });
    }

// Solution button
const solutionBtn = document.getElementById('solution-btn');
if (solutionBtn) {
    const boardArray = document.getElementById('board');
    const solutionArray = document.getElementById('solution');
    solutionBtn.addEventListener('click', () => {
        if(isGameOver || isGamePaused) {
            return;
        }
        if (!isSolutionVisible) {
            boardArray.style.display = 'none';
            solutionArray.style.display = 'grid';
            solutionBtn.classList.add("special-clicked");
            isSolutionVisible = true;
        } else {
            boardArray.style.display = 'grid';
            solutionArray.style.display = 'none';
            solutionBtn.classList.remove("special-clicked");
            isSolutionVisible = false;
        }
    });
}

// Hint button
const hintBtn = document.getElementById('hint-btn');
if (hintBtn) {
    hintBtn.addEventListener('click', () => {
        if (isGameOver || isGamePaused) {
            return;
        }

        console.log("hint button clicked");

        var hintTile;
        if (tileSelected !== null) {
            hintTile = tileSelected;
        } else {
            hintTile = unfilledTiles[Math.floor(Math.random() * unfilledTiles.length)];
        }
        
        let coords = hintTile.id.split(":");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        
        if(hintTile.innerText === parseInt(solution[r][c])) {
            return;
        }

        hintCnt++;
        actionChosen(solution[r][c].toString(), hintTile);
    });
}