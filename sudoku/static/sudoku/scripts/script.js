// import { isGamePaused } from './timer.js';
import { prepareBoard } from './board.js';
import { newGame, startingBoard, solution } from './gameplay.js';

// var difficultyLevel = 0;
const isMobile = window.screen.width <= 768;

const currentPath = window.location.pathname;
export const isOnSolveSudoku = currentPath.includes('/solve_sudoku');
export const isOnHistory = currentPath.includes('/history');
export const isOnSettings = currentPath.includes('/settings');

window.onload = function() {
    if (isOnSolveSudoku) {
        solveSudokuPage();
    }
    if (isOnHistory) {
        historyPage();
    }

    const settingsLink = document.getElementById('settings-gear');

    // Store the previous page (if not on settings)
    if (!window.location.pathname.includes('/settings')) {
        sessionStorage.setItem('previousPage', window.location.pathname);
    }

    settingsLink?.addEventListener('click', function (e) {
        console.log("settings link clicked");
        const currentPath = window.location.pathname;
        const isOnSettings = currentPath.includes('/settings');
        const previousPage = sessionStorage.getItem('previousPage') || '/';

        if (isOnSettings) {
            e.preventDefault(); // Stop the default navigation
            window.location.href = previousPage; // Go back
        } else {
            // Let it go to /settings normally
        }
    });
}

export function sendSolvedSudoku() {
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

// ------------------ Solve Sudoku ------------------------
function solveSudokuPage() {
    console.log("solve sudoku page");
    prepareBoard("board");
    if(!isMobile) {
        newGame(0);
    }
}

// Timer Switch
const timerSwitch = document.getElementById('timer-switch');
if (timerSwitch) {
    timerSwitch.addEventListener("change", function() {
        document.getElementById('clock-container').classList.toggle('hide');
    });
}

// --- Special buttons ---
const specialSwitch = document.getElementById('special-switch');
if (specialSwitch) {
    specialSwitch.addEventListener("change", function() {
        document.getElementById('special').classList.toggle('show');
    });
}



// // Finished the game
// document.addEventListener('gameWon', function() {
//     sendSolvedSudoku();
//     GameOver();
// });

// --------------------------------------------------------

// ------------------ History page ------------------------
function historyPage() {
    document.querySelectorAll('.history-card').forEach(function(container) {
        var boardName = container.getAttribute('data-name');
        var board = JSON.parse(container.getAttribute('data-board'));
        var solution = JSON.parse(container.getAttribute('data-solution'));
        console.log(boardName);
        prepareBoard("board" + boardName, board, solution);
    });
}

// Select all delete buttons
const deleteButtons = document.querySelectorAll('.delete-btn');

// Add event listener to each delete button
deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
        const sudokuId = button.getAttribute('data-id'); // Get the Sudoku ID from the button's data-id attribute

        // Call the delete function and pass the Sudoku ID
        deleteSudoku(sudokuId);
    });
});

// Function to delete Sudoku from database
async function deleteSudoku(sudokuId) {
    try {
        const response = await fetch(`/api/sudoku/${sudokuId}`, {
            method: 'DELETE', // Use DELETE method
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // If deletion is successful, remove the card from the UI
            const cardToDelete = document.querySelector(`.history-card .delete-btn[data-id="${sudokuId}"]`).closest('.history-card');
            cardToDelete.remove(); // Remove the card from the DOM
            alert('Sudoku deleted successfully!');
        } else {
            alert('Error deleting Sudoku!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting Sudoku!');
    }
}
// --------------------------------------------------------


// ------------------ Settings page ------------------------
// should be on load - change to onload

// ---------------------------------------------------------
