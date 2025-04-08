import { deselectAll } from "./gameplay.js";
import { openPopup } from "./popup.js";
import { sendSolvedSudoku } from "./script.js";

var startTime;
export var isGamePaused = false;
export var isGameOver = true;
var timePlayed;
var pauseTime = 0;
const isMobile = window.screen.width <= 768;


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

export function resetTimer() {
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

// --------------------------------- Game pausing logic --------------------------------------

const pauseButton = document.getElementById('pause-btn');
if (pauseButton) {
    pauseButton.addEventListener('click', function() {
        pauseResume();
    });
}

export function pauseResume() {
    if (isGamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

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
    isGamePaused = true;
    deselectAll();
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

export function GameOver() {
    isGameOver = true;
    pauseGame();
    openPopup();
    sendSolvedSudoku();
}