import { hintCnt } from "./gameplay.js";

export function openPopup() {
    console.log("open popup");
    const popup = document.querySelector('.popup');
    popup.querySelector('.time-played').innerText = "Time played: " + document.getElementById("clock").innerText;
    popup.querySelector('.hint-count').innerText = "You used " + hintCnt + " hints.";
    popup.classList.add("popup-show");
}

export function closePopup() {
    document.querySelector('.popup').classList.remove("popup-show");
}

// Close popup window
const closeButton = document.querySelector('.close');
if (closeButton) {
    closeButton.addEventListener('click', function() {
        closePopup();
    });
}