// init emulator
let emulator;

let paramsString = location.search;
let searchParams = new URLSearchParams(paramsString);

window.addEventListener('DOMContentLoaded', () => {
  const leds = [
    {
      pin: 2,
      avrPort: 'portD',
      avrPin: 2,
      domElement: document.querySelector('#light-0'),
      state: false,
    },
    {
      pin: 3,
      avrPort: 'portD',
      avrPin: 3,
      domElement: document.querySelector('#light-1'),
      state: false,
    },
    {
      pin: 4,
      avrPort: 'portD',
      avrPin: 4,
      domElement: document.querySelector('#light-2'),
      state: false,
    }
  ];

  const button = {
    pin: 5,
    avrPort: 'portD',
    avrPin: 5,
    domElement: document.querySelector('#button'),
    state: false,
  };

  emulator = new Emulator(leds, button); 
});

// visualize button press on spacebar down
document.body.addEventListener("keydown", e =>{
  if (e.key === " " ){
    document.querySelector("#button").classList.add("buttondown");
  }
});
document.body.addEventListener("keyup", e =>{
  if (e.key === " " ){
    document.querySelector("#button").classList.remove("buttondown");
  }
});


// document.querySelector("#button").classList.add("buttondown")

// show and hide source
let showSource = false;

document.querySelectorAll(".source-link").forEach(item => {
  item.addEventListener("click", e => {

    if (showSource) {
      document.getElementById("source").classList.add("hidden");
      document.querySelectorAll(".source-link").forEach(jtem => {
        jtem.innerHTML = "View game source";
      });
    } else {
      document.getElementById("source").classList.remove("hidden");
      document.querySelectorAll(".source-link").forEach(jtem => {
        jtem.innerHTML = "Hide game source";
      });
    }
    showSource = !showSource;
  });
});

// load game info
const titleEl = document.getElementById("title");
const authorEl = document.getElementById("author");
const instructionsEl = document.getElementById("instructions");
const sourceEl = document.getElementById("source-code");
const gameSelectionEl = document.getElementById("game-selection");

// store json data so that changeGame() can access this.
let gameData;

fetch('games.json')
  .then(response => response.json())
  .then(data => {

    // store json data so that changeGame() can access this.
    gameData = data;

    // open the first game
    if (searchParams.has("game")){
      changeGame(findGame(searchParams.get("game")));
    } else {
      changeGame(0);
    }


    //create games list
    data.games.forEach((game, i) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.setAttribute("href", "#");
      a.setAttribute("onclick", "changeGame(" + i + ")");
      const title = document.createTextNode(game.title);
      a.appendChild(title);

      li.appendChild(a);
      gameSelectionEl.append(li);
  
    });
  });

// find id from slug name
function findGame(slug){
  let id;
  gameData.games.forEach((game, i) => {
    if (game.slug == slug){
      id = i;
      return;
    }
  });
  return id;
}

// change the game
function changeGame(id){
  const game = gameData.games[id];
  titleEl.innerHTML = game.title;
  authorEl.innerHTML = game.author;
  instructionsEl.innerHTML = game.instructions;
  //get source
  fetch(`games/${game.path.ino}`)
    .then(response => response.text())
    .then(data => {
      console.log(data);
      sourceEl.innerHTML = escapeHtml(data);
      // turn on code highlight
      hljs.highlightAll();
    });


  //stop running old game
  emulator.stopGame();

  if(game.path) {
    executeGame(game);
  }

  searchParams.set("game", game.slug);
  window.history.pushState("game", "game", "index.htm?" + searchParams.toString());
  // location.search = searchParams.toString();
}

async function executeGame(game) {
  const res = await fetch(`games/${game.path.hex}`); 
  const hex = await res.text();
  emulator.loadGame(hex); 
  emulator.executeGame(); 
}

function toggleAbout() {
  let about = document.getElementById("about");
  if (about.style.display != "block") {
    about.style.display = "block";
  } else {
    about.style.display = "none";
  }
} 

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}