import { prepareBoard } from './board.js';
import { newGame, startingBoard, solution } from './gameplay.js';

const isMobile = window.screen.width <= 768;

const currentPath = window.location.pathname;
export const isOnSolveSudoku = currentPath.includes('/solve_sudoku');
export const isOnHistory = currentPath.includes('/history');
export const isOnSettings = currentPath.includes('/settings');
export const isOnHome = currentPath === '/';

// Gameplay variables
export var autoCheck = true;

window.onload = function() {
    // Theme

    if (isOnSolveSudoku) {
        solveSudokuPage();
    }
    if (isOnHistory) {
        historyPage();
    }
    if (isOnSettings) {
        settingsPage();
    }
    if (!isMobile && isOnHome) {
        homePage();
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

// ------------------ Home Page ------------------------
function randomLeft() {
    return Math.random() < 0.5
        ? Math.random() * 18 
        : 82 + Math.random() * 18;
}

function randomTop() {
    return Math.random() * 90;
}

function createFloatingNumber() {
    const num = document.createElement("div");
    num.className = "num";
    num.textContent = Math.floor(Math.random() * 9) + 1;

    num.style.left = `${randomLeft()}%`;
    num.style.top = `${randomTop()}%`;

    document.querySelector(".bg-animation").appendChild(num);

    // Individual rerolling every 3 seconds for each number
    setInterval(() => {
        num.style.left = `${randomLeft()}%`;
        num.style.top = `${randomTop()}%`;
    }, 3000); // Reposition every 3 seconds

    // Remove the number after 10 seconds to avoid memory leaks
    setTimeout(() => num.remove(), 10000);
}


function homePage() {
    // const totalNums = 10;
    // for (let i = 0; i < totalNums; i++) {
    //     setTimeout(() => createFloatingNumber(i), i * 100);
    // }
    // setInterval((i) => {
    //     setTimeout(() => createFloatingNumber(i), i * 100); // Stagger each by 100ms
    // }, 1000); // Create new number every second

    
    let puzzlesSolved = 0;
    let finalPuzzlesSolved = document.getElementById('solved-puzzles').getAttribute('data-solved');
    let usersCount = 0;
    let finalUsersCount = document.getElementById('users-count').getAttribute('data-users');
    let challengesCompleted = 0;

    const interval = setInterval(() => {
        if (puzzlesSolved < finalPuzzlesSolved) puzzlesSolved++;
        if (usersCount < finalUsersCount) usersCount++;
        if (challengesCompleted < 25) challengesCompleted++;

        document.getElementById('solved-puzzles').innerText = puzzlesSolved;
        document.getElementById('users-count').innerText = usersCount;
        document.getElementById('challenges-completed').innerText = challengesCompleted;

        if (puzzlesSolved === 100 && usersCount === 50 && challengesCompleted === 25) {
            clearInterval(interval); // Stop when stats reach desired values
        }
    }, 50); // Update every 50ms for a smooth animation

    window.addEventListener('scroll', function() {
        const elements = document.querySelectorAll('.animate-element');
        elements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight) {
                element.classList.add('visible');
            }
        });
    });    
}
// -------------------------------------------------------- 

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
function settingsPage() {
    // Theme Switcher
    // const themeSwitcher = document.getElementById('theme-selector');
    // if (!themeSwitcher) return;
      
    // themeSwitcher.value = document.documentElement.getAttribute('data-theme');
      
    // themeSwitcher.addEventListener('change', () => {
    //     // console.log("theme switcher changed");
    //     const newTheme = themeSwitcher.value;
    //     document.documentElement.setAttribute('data-theme', newTheme);
    //     localStorage.setItem('theme', newTheme);
    // });

    // document.addEventListener("DOMContentLoaded", function () {
        const themeCards = document.querySelectorAll('.theme-card');
        const colorSchemeToggle = document.getElementById('color-scheme-toggle');
        
        // Add event listener for each theme card
        themeCards.forEach(card => {
          card.addEventListener('click', () => {
            // Remove the 'selected' class from all cards
            themeCards.forEach(c => c.classList.remove('selected'));
            
            // Add 'selected' class to the clicked card
            card.classList.add('selected');
            
            // Get the selected theme
            const selectedTheme = card.getAttribute('data-theme');
            
            // Apply the selected theme to the root element
            document.documentElement.setAttribute('data-theme', selectedTheme);
            localStorage.setItem('theme', selectedTheme);
          });
        });
      
        // Load theme from localStorage if available
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          const selectedCard = document.querySelector(`.theme-card[data-theme="${savedTheme}"]`);
          if (selectedCard) {
            selectedCard.classList.add('selected');
          }
        }
    //   });
      

    // Dark Mode switch
    const themeToggleButton = document.getElementById('color-scheme-toggle');
    if (!themeToggleButton) return;
    
    let currentMode = document.documentElement.getAttribute('data-mode');
    themeToggleButton.textContent = currentMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';

    themeToggleButton.addEventListener('click', () => {
        let currentMode = document.documentElement.getAttribute('data-mode');
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-mode', newMode);
        themeToggleButton.textContent = newMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        localStorage.setItem('mode', newMode);
    });
}

// ---------------------------------------------------------
