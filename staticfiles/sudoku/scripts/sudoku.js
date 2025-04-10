export var digitUsage = new Array(10);

const BOARD_SIZE = 9;
const BOX_SIZE = 3;

export class Sudoku {
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