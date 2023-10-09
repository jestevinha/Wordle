const answer = document.querySelector(".answer");
const rows = document.querySelectorAll(".game-row");
const letters = document.querySelectorAll(".letter");
let currentRow = 0;
let currentLetter = 0;
let hasGameFinished = false;
let letterArray = [];
let word = "";
let wordArray = [];
rows.forEach((row) => {
  letterArray.push(row.querySelectorAll(".letter"));
});

document.addEventListener("keyup", (event) => {
  if (!hasGameFinished) processKey(event.key);
  else if (event.key == "Enter") initiateGame();
});

function initiateGame() {
  currentRow = 0;
  currentLetter = 0;
  hasGameFinished = false;
  word = "";
  wordArray = [];
  resetBoard();
  getWord();
}

function resetBoard() {
  letters.forEach((letter) => {
    letter.innerText = "";
    letter.classList.remove("played");
    letter.style.backgroundColor = "white";
  });
  answer.innerText = "";
}

async function isValidWord(word) {
  let promise = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: `${word}` }),
  });
  let response = await promise.json();

  return response.validWord;
}

function getWord() {
  let promise = fetch("https://words.dev-apis.com/word-of-the-day?random=1");
  promise
    .then((response) => response.json())
    .then((data) => {
      word = data.word.toUpperCase();
      wordArray = word.split("");
    })
    .catch((error) => console.log("ERROR fetching word: ", error));
}
function isLetter(key) {
  const letterRegex = /^[a-zA-Z]$/;
  return letterRegex.test(key);
}

function addLetter(letter) {
  if (currentLetter < 5) {
    letterArray[currentRow][currentLetter].innerText = letter;
    currentLetter++;
  }
}

async function validateWord() {
  const map = makeMap(wordArray);
  if (currentLetter !== 5) return;
  let isWordValid = await isValidWord(buildWord());
  if (isWordValid) {
    wordArray.forEach((letter, i) => {
      letterArray[currentRow][i].classList.add("played");
      if (letterArray[currentRow][i].innerText === letter) {
        letterArray[currentRow][i].style.backgroundColor = "green";
        map[letter]--;
      }
    });

    wordArray.forEach((letter, i) => {
      if (letterArray[currentRow][i].innerText !== letter) {
        if (
          answerContainsLetter(letterArray[currentRow][i].innerText, i) &&
          map[letterArray[currentRow][i].innerText] > 0 &&
          letterArray[currentRow][i].innerText !== letter
        ) {
          letterArray[currentRow][i].style.backgroundColor = "yellow";
          map[letterArray[currentRow][i].innerText]--;
        } else letterArray[currentRow][i].style.backgroundColor = "gray";
      }
    });
    if (isRightAnswer()) {
      alert("Congratulations, you won!");
      answer.innerText = `The answer is: ${word}. Press enter to retry`;
      hasGameFinished = true;
    }

    currentRow++;
    if (currentRow === 6) {
      alert("Sorry, you lost.");
      answer.innerText = `The answer was: ${word}. Press enter to retry`;
      hasGameFinished = true;
    }
    currentLetter = 0;
  } else {
    alert(`${buildWord()} is not a valid word`);
  }
}

function buildWord() {
  let result = "";
  letterArray[currentRow].forEach((letter) => (result += letter.innerText));
  return result;
}

function isRightAnswer() {
  if (currentLetter != 5) return false;
  let isRightAnswer = true;
  letterArray[currentRow].forEach((letterBox) => {
    if (letterBox.style.backgroundColor != "green") isRightAnswer = false;
  });
  return isRightAnswer;
}

function answerContainsLetter(letter, index) {
  return wordArray.find(
    (arrayLetter, i) => arrayLetter === letter && index !== i
  );
}

function deleteLetter() {
  if (currentLetter > 0) {
    letterArray[currentRow][currentLetter - 1].innerText = "";
    currentLetter--;
  }
}

function processKey(letter) {
  if (isLetter(letter)) addLetter(letter);
  else if (letter === "Backspace") deleteLetter();
  else if (letter === "Enter") {
    validateWord();
  }
}

function makeMap(letters) {
  let obj = {};
  letters.forEach((letter) => {
    if (obj[letter]) obj[letter]++;
    else obj[letter] = 1;
  });
  return obj;
}
initiateGame();
