var numSelected = null;
var tileSelected = null;
var digitsLeft;
var startTime;
var isGamePaused = false;
var isGameOver = true;
var timePlayed;
var pauseTime = 0;
var isSolutionVisible = false;
var isNotesSelected = false;
let digitUsage = new Array(10);
var unfilledTiles = [];
var solution;
var board;
var startingBoard;
var hintCnt;
var difficultyLevel = 0;

const isMobile = window.screen.width <= 768;

var BOARD_SIZE = 9;
var BOX_SIZE = 3;

window.onload = function() {
    prepareBoard();
    if(isMobile) {
        isGamePaused = true;
        document.getElementById('sudoku-container').classList.add('paused');
        // toggleMenu();
    }
    if (!isMobile) {
        newGame();
    }

    // // Delete later
    // const newGameTempBtn = document.getElementById('temp'); 
    // newGameTempBtn.addEventListener('click', function() {
    //     difficultyLevel = 3;
    //     newGame();
    // });

    // New game buttons
    const newGameEasyBtn = document.getElementById('easy');
    const newGameMediumBtn = document.getElementById('medium');
    const newGameHardBtn = document.getElementById('hard');
    const newGamePopupBtn = document.getElementById('new-game-popup');
    newGameEasyBtn.addEventListener('click', function() {
        difficultyLevel = 0;
        newGame();
    });
    newGameMediumBtn.addEventListener('click', function() {
        difficultyLevel = 1;
        newGame()
    });
    newGameHardBtn.addEventListener('click', function() {
        difficultyLevel = 2;
        newGame();
    });
    newGamePopupBtn.addEventListener('click', function() {
        closePopup();
        newGame();
    });

    // Timer Switch
    const timerSwitch = document.getElementById('timer-switch');
    timerSwitch.addEventListener("change", function() {
        document.getElementById('clock-container').classList.toggle('hide');
    });

    // --- Special buttons ---
    // const specialSwitch = document.getElementById('special-switch');
    // specialSwitch.addEventListener("change", function() {
    //     document.getElementById('special').classList.toggle('show');
    // });

    // Erase button
    const eraseButton = document.getElementById('erase-btn');
    eraseButton.addEventListener("click", function() { selectNumber('erase-btn'); });

    // Solution button
    const solutionBtn = document.getElementById('solution-btn');
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

    // Hint button
    const hintBtn = document.getElementById('hint-btn');
    hintBtn.addEventListener('click', () => {
        if (isGameOver || isGamePaused) {
            return;
        }

        console.log("hint button clicked");

        if (tileSelected !== null) {
            hintTile = tileSelected;
        } else {
            hintTile = unfilledTiles[Math.floor(Math.random() * unfilledTiles.length)];
            console.log(hintTile);
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

    // Notes button
    const notesBtn = document.getElementById("notes-btn");
    notesBtn.addEventListener('click', () => {
        if (isGameOver || isGamePaused) {
            return;
        }
        if (!isNotesSelected) {
            notesBtn.classList.add("special-clicked");
            document.getElementById("notes").style.display = "flex";
            isNotesSelected = true;
        } else {
            notesBtn.classList.remove("special-clicked");
            document.getElementById("notes").style.display = "none";
            isNotesSelected = false;
        }
    });


    // Toggle menu button
    document.getElementById('options-toggle').addEventListener('click', function() {
        toggleMenu();
    });

    // Pause game
    const pauseButton = document.getElementById('pause-btn');
    pauseButton.addEventListener('click', function() {
        pauseResume();
    });

    // Finished the game
    document.addEventListener('gameWon', function() {
        sendSolvedSudoku();
        openPopup();
    });

    // Close popup window
    const closeButton = document.querySelector('.close');
    closeButton.addEventListener('click', function() {
        closePopup();
    });
}

function sendSolvedSudoku() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    const dataToSend = {
        name: 'Sudoku #' + Date.now(),
        board: startingBoard,
        solution: solution,
        time: document.getElementById("clock").innerText
    };

    fetch('/solve_sudoku/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Saved successfully!', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function toggleMenu() {
    console.log("toggle menu");
    document.getElementById('options').classList.toggle('resumed');
    document.getElementById('options-toggle').classList.toggle('resumed');
    document.getElementById('sudoku-container').classList.toggle('paused');
    pauseResume();
}

function pauseResume() {
    if (isGamePaused) {
        console.log("resuming game");
        resumeGame();
    } else {
        console.log("pausing game");
        pauseGame();
    }
}

function prepareBoard() {
    // Digits
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", function() { selectNumber(i.toString()); });
        number.classList.add("number", "prevent-text-select");
        document.getElementById("numbers").appendChild(number);
    }

    // Notes
    for (let i = 1; i <= 9; i++) {
        let note = document.createElement("div");
        note.id = i + "n";
        note.innerText = i;
        note.addEventListener("click", function() { selectNumber(note.id.toString()); });
        note.classList.add("note", "prevent-text-select");
        document.getElementById("notes").appendChild(note);
    }

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + ":" + c.toString();
            if(r == 2 || r == 5) {
                tile.style.borderBottom = "2px solid black";
            }
            // if (r == 3 || r == 6) {
            //     tile.style.borderTop = "2px solid black";
            // }
            if(c == 2 || c == 5) {
                tile.style.borderRight = "2px solid black";
            }
            // if (c == 3 || c == 6) {
            //     tile.style.borderLeft = "2px solid black";
            // }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile", "prevent-text-select");
            
            for(let nr = 0; nr < BOX_SIZE; nr++) {
                for(let nc = 0; nc < BOX_SIZE; nc++) {
                    let noteTile = document.createElement("div");
                    noteTile.id = r.toString() + ":" + c.toString() + ":" + (nr*3 + nc + 1).toString();
                    noteTile.classList.add("tile-note", "prevent-text-select");
                    tile.appendChild(noteTile);
                }
            }
            document.getElementById("board").appendChild(tile);
        }
    }
    // console.log(document.getElementById("8:8:9"));

    // solution
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

function newGame() {
    console.log("new game");
    if(isMobile) {
        toggleMenu();
        console.log("mobile");
        document.getElementById('options-toggle').classList.add('activated');
    }
    
    // Set removedDigits based on difficulty level
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

    // if(isMobile) {
    //     pauseGame();
    // }

    console.log(digitUsage);
    updateDigitUsageClasses();

    // Unfilled tiles
    tempUnfilled = [];
    unfilledTiles = [];
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = board[r][c];
            if(board[r][c] === 0) {
                // console.log("unfilled tile " + r + ", " + c);
                tempUnfilled.push(r + ", " + c);
                unfilledTiles.push(document.getElementById(r.toString() + ":" + c.toString()));
            }
        }
    }

    console.log(tempUnfilled);

    // Board
    for(let r = 0; r < BOARD_SIZE; r++) {
        for(let c = 0; c < BOARD_SIZE; c++) {
            let tile = document.getElementById(r.toString() + ":" + c.toString());
            // console.log(document.getElementById("8:8:9"));
            tile.innerHTML = "";
            // console.log(document.getElementById("8:8:9"));
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
    console.log(startingBoard);
}

// ------------------------------------ Tile and number logic --------------------------------

function deselectAll() {
    if(numSelected != null) {
        numSelected.classList.remove("number-selected");
        numSelected = null;
    }
    if(tileSelected != null) {
        tileSelected.classList.remove("tile-selected");
        tileSelected = null;
    }
}

function selectNumber(numberId) {
    // console.log("selected number");
    if(isGamePaused || digitUsage[parseInt(numberId[0])] === 9) {
        return;
    }

    if(tileSelected) {
        actionChosen(numberId, tileSelected);
    }
    else {
        selectNewDigit(numberId);
    }
}

function selectTile() {
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

function addNewNote(row, col, number, tile) {
    console.log("placing note");
    // let noteTileId = tile.id + ":" + number.toString();
    // let noteTileId = row.toString() + ":" + col.toString() + ":" + number.toString()
    // let notetile = document.getElementById(noteTileId);
    let notetile = document.getElementById("8:8:9");
    // let notetile = document.getElementById(tile.id);
    // let notetile = tile.children[1];
    // console.log(tile.id);
    // console.log(tile.id +  ":" + number.toString());
    // console.log(tile.children.length);
    console.log(notetile.id);
}

function actionChosen(numberId, tile) {
    // console.log("action chosen");
    let coords = tile.id.split(":");
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if(numberId === "erase-btn") {
        numberId = "0";
    }

    // notes
    if(numberId.length === 2) {
        removeSameDigit(r, c, tile.innerText, tile);
        addNewNote(r, c, parseInt(numberId[0]), tile);
    }
    else {
        if(numberId === tile.innerText) {
            removeSameDigit(r, c, parseInt(numberId), tile);
        }
        else {
            addNewDigit(r, c, parseInt(numberId), tile);
        }
    }

    updateDigitUsageClasses();
    console.log(digitUsage);
    console.log(unfilledTiles.length);
}

// Segregate used up digits
function updateDigitUsageClasses() {
    for (let i = 1; i <= 9; i++) {
        const numberElement = document.getElementById(i);
        const noteElement = document.getElementById(i+"n");
        if (digitUsage[i] === 9) {
            numberElement.classList.add('number-used');
            noteElement.classList.add('number-used');
            numberElement.classList.remove('number-selected');
            noteElement.classList.remove('number-selected');
            if(numSelected != null && (numSelected.id === i.toString() || numSelected.id === i.toString()+"n")) {
                numSelected = null;
            }
        } else {
            numberElement.classList.remove('number-used');
            noteElement.classList.remove('number-used');
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
}

// -------------------------------------------------------------------------------------------

// -------------------------------------- Timer logic ----------------------------------------
function setTimer() {
    var now = new Date().getTime();
    var distance = now - startTime;
    
    // Time calculations for days, hours, minutes and seconds
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
    if(seconds < 10)
        seconds = "0" + seconds;
    if(minutes < 10)
        minutes = "0" + minutes;
    
    // Output the result in an element with id="demo"
    if(hours > 0) {
        document.getElementById("clock").innerHTML = hours + ":" + minutes + ":" + seconds;
    } else {
        document.getElementById("clock").innerHTML = minutes + ":" + seconds;
  }
}

function resetTimer() {
    isGameOver = false;
    if(isGamePaused) {
        resumeGame(); // Unpause the game if ended paused
    }
    document.getElementById("clock").innerHTML = "00:00";
    clearInterval(timePlayed); // Stop the previous timer
    startTime = new Date().getTime(); // Reset the start time
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timePlayed); // Stop the timer
    pauseTime = new Date().getTime(); // Record the pause time
}

function resumeTimer() {
    var now = new Date().getTime();
    var pauseDuration = now - pauseTime; // Calculate the pause duration
    startTime += pauseDuration; // Update the start time
    timePlayed = setInterval(function() {
        setTimer();
    }, 1000); // Resume the timer
}

// Pause the timer when outside of the page
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        if(!isGamePaused && !isGameOver) {
            pauseTimer();
        }
    } else {
        if(!isGamePaused &&!isGameOver) {
            resumeTimer();
        }
    }
  });

// -------------------------------------------------------------------------------------------

// --------------------------------- Game pausing logic --------------------------------------

function pauseGameIcons() {
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.add('paused');
    pauseIcon.classList.remove('resumed');
    playIcon.classList.add('paused');
    playIcon.classList.remove('resumed');
}

function resumeGameIcons() {
    const pauseIcon = document.getElementById('pause-icon');
    const playIcon = document.getElementById('play-icon');
    pauseIcon.classList.remove('paused');
    pauseIcon.classList.add('resumed');
    playIcon.classList.remove('paused');
    playIcon.classList.add('resumed');
}

function pauseGame() {
    // if(isGameOver) {
    //     return;
    // }
    isGamePaused = true;
    deselectAll();  // Deselect selected elements
    pauseTimer();
    pauseGameIcons();

    // Only hide the board if the game is not over
    if(!isGameOver) {
        showPauseScreen();
    }
}

function resumeGame() {
    if(isGameOver) {
        return;
    }
    isGamePaused = false;
    resumeTimer();
    resumeGameIcons();
    hidePauseScreen();
}

function showPauseScreen() {
    if(isMobile) {
        return;
    }
    const boardArray = document.getElementById('board');
    const pauseScreen = document.getElementById('pause-screen');
    boardArray.style.display = 'none';
    pauseScreen.style.display = 'grid';
}

function hidePauseScreen() {
    if(isMobile) {
        return;
    }
    const boardArray = document.getElementById('board');
    const pauseScreen = document.getElementById('pause-screen');
    boardArray.style.display = 'grid';
    pauseScreen.style.display = 'none';
}


// ------------------------------------- Popup Window ----------------------------------------
function openPopup() {
    isGameOver = true;
    pauseGame();
    const popup = document.querySelector('.popup');
    popup.querySelector('.time-played').innerText = "Time played: " + document.getElementById("clock").innerText;
    popup.querySelector('.hint-count').innerText = "You used " + hintCnt + " hints.";
    popup.classList.add("popup-show");
    deselectAll();
}

function closePopup() {
    document.querySelector('.popup').classList.remove("popup-show");
}
// -------------------------------------------------------------------------------------------



// ------------------------------------- Sudoku Class ----------------------------------------

class Sudoku {
    constructor(removedDigits) {
        this.removedDigits = removedDigits;
        this.board = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(0))
        this.solution = Array(BOARD_SIZE);
        this.temp = Array(BOARD_SIZE);

        this.fillSudoku();
        for(let i = 0; i < BOARD_SIZE; i++) {
            this.temp[i] = (this.board[i]).join('');
        }
        this.solution = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(0));
        this.solution = this.board.map(row => row.map(num => parseInt(num)));

        this.removeDigits();
        for(let i = 0; i < BOARD_SIZE; i++) {
            this.temp[i] = (this.board[i]).join('');
        }
        this.startingBoard = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(0));
        this.startingBoard = this.board.map(row => row.map(num => parseInt(num)));
    }

    fillSudoku() {
        this.fillDiagonalBoxes();
        this.fillRemainingBoxes(0, BOX_SIZE);
    }

    fillDiagonalBoxes() {
        // For each box on a diagonal
        for(let rc = 0; rc < BOARD_SIZE; rc += BOX_SIZE) {
            // Fill it randomly
            this.fillBox(rc, rc);
        }
    }

    fillRemainingBoxes(row, col) {
        // If we are at the end of board - return
        if (row === BOARD_SIZE - 1 && col === BOARD_SIZE) {
            return true;
        }
    
        // When reached the end of row move to the next one
        if (col === BOARD_SIZE) {
            row += 1;
            col = 0;
        }
    
        // Skip cells that are already filled
        if (this.board[row][col] !== 0) {
            return this.fillRemainingBoxes(row, col + 1);
        }
    
        // Try filling the current cell with a valid value
        for (let num = 1; num <= BOARD_SIZE; num++) {
            if (this.isValidNumber(row, col, num)) {
                this.board[row][col] = num;
                if (this.fillRemainingBoxes(row, col + 1)) {
                    return true;
                }
                this.board[row][col] = 0;
            }
        }
    
        // No valid value was found, so backtrack
        return false;
    }

    fillBox(row, col) {
        let num = 0;
        for (let i = 0; i < BOX_SIZE; i++) {
            for (let j = 0; j < BOX_SIZE; j++) {
                while (true) {
                    num = Math.floor(Math.random() * BOARD_SIZE + 1);
                    if (!this.isUsedInBox(row, col, num)) {
                        break;
                    }
                }
                this.board[row + i][col + j] = num;
            }
        }
    }

    // Check if given number is used in box [row,col]x[row+3,col+3]
    isUsedInBox(row, col, num) {
        for (let i = 0; i < BOX_SIZE; i++) {
            for (let j = 0; j < BOX_SIZE; j++) {
                if (this.board[row + i][col + j] === num) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check if given number is used in given row
    isUsedInRow(row, num) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (this.board[row][col] === num) {
                return true;
            }
        }
        return false;
    }

    // Check if given number is used in given column
    isUsedInCol(col, num) {
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (this.board[row][col] === num) {
                return true;
            }
        }
        return false;
    }

    // Check if safe to put in cell
    isValidNumber(i, j, num) {
        return (
            !this.isUsedInRow(i, num) &&
            !this.isUsedInCol(j, num) &&
            !this.isUsedInBox(i - (i % BOX_SIZE), j - (j % BOX_SIZE), num)
        );
    }

    // Remove given number of digits
    removeDigits() {
        let count = this.removedDigits;

        while (count !== 0) {
            // extract coordinates i and j
            let row = Math.floor(Math.random() * BOARD_SIZE);
            let col = Math.floor(Math.random() * BOARD_SIZE);
            if (this.board[row][col] !== 0) {
                let temp = this.board[row][col];
                this.board[row][col] = 0;
                if (this.isUniquelySolvable(this.board)) {
                    digitUsage[temp]--;
                    count--;
                } else {
                    this.board[row][col] = temp;
                }
            }
        }

        return;
    }

    isUniquelySolvable(board) {
        let solutions = 0;
        let tempBoard = board.map(row => row.slice()); // Create a copy of the board
    
        function solveBoard() {
            for (let i = 0; i < 81; i++) {
                let row = Math.floor(i / 9);
                let col = i % 9;
                if (tempBoard[row][col] == 0) {
                    for (let value = 1; value <= 9; value++) {
                        if (isValidNumber(row, col, value)) {
                            tempBoard[row][col] = value;
                            solveBoard();
                            tempBoard[row][col] = 0;
                        }
                    }
                    return;
                }
            }
            solutions++;
        }
    
        // fix outside isValidNumber to take a board as an argument
        function isValidNumber(row, col, num) {
            // Check the row
            for (let i = 0; i < 9; i++) {
                if (tempBoard[row][i] == num) {
                    return false;
                }
            }
    
            // Check the column
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i][col] == num) {
                    return false;
                }
            }
    
            // Check the box
            let boxRow = Math.floor(row / 3) * 3;
            let boxCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (tempBoard[boxRow + i][boxCol + j] == num) {
                        return false;
                    }
                }
            }
    
            return true;
        }
    
        solveBoard();
        return solutions == 1;
    }
    
}