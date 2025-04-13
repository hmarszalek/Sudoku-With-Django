import { sendUserPreferences } from "./script.js";

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function applyMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);
}

// Add event listeners to theme cards
const themeCards = document.querySelectorAll('.theme-card');
if(themeCards) {
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.getAttribute('data-theme');
            applyTheme(theme);
            sendUserPreferences();
        });
    });
}

// Handle color-scheme toggle (Dark/Light mode)
const toggleButton = document.getElementById('color-scheme-toggle');
if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        const currentMode = document.documentElement.getAttribute('data-mode') || 'light';
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-mode', newMode);
        toggleButton.textContent = newMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        localStorage.setItem('mode', newMode);
        applyMode(newMode);
        sendUserPreferences();
    });
}

// Gameplay settings

// const highlightCellsCheckbox = document.getElementById('highlight-cells');
// if (highlightCellsCheckbox) {
//     highlightCellsCheckbox.addEventListener('change', () => {
//         highlightCells = highlightCellsCheckbox.checked;
//         sendUserPreferences();
//     });
// }
// const highlightNumbersCheckbox = document.getElementById('highlight-numbers');
// if (highlightNumbersCheckbox) {
//     highlightNumbersCheckbox.addEventListener('change', () => {
//         highlightNumbers = highlightNumbersCheckbox.checked;
//         sendUserPreferences();
//     });
// }
// const autoCheckCheckbox = document.getElementById('auto-check');
// if (autoCheckCheckbox) {
//     autoCheckCheckbox.addEventListener('change', () => {
//         autoCheck = autoCheckCheckbox.checked;
//         sendUserPreferences();
//     });
// }

const saveButton = document.getElementById('save-settings-btn');
if (saveButton) {
    saveButton.addEventListener('click', () => {
        let highlightCells = document.getElementById('highlight-cells').checked;
        let highlightNumbers = document.getElementById('highlight-numbers').checked;
        let autoCheck = document.getElementById('auto-check').checked;

        document.getElementById('highlight-cells').setAttribute('data-boolean', highlightCells);
        document.getElementById('highlight-numbers').setAttribute('data-boolean', highlightNumbers);
        document.getElementById('auto-check').setAttribute('data-boolean', autoCheck);

        sendUserPreferences();
    });
}