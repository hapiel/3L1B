// init emulator
const emulator = new Emulator('#light-0'); 

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
    changeGame(0);

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

// change the game
function changeGame(id){
  const game = gameData.games[id];
  titleEl.innerHTML = game.title;
  authorEl.innerHTML = game.author;
  instructionsEl.innerHTML = game.instructions;
  sourceEl.innerHTML = game.source;

  // turn on code highlight
  hljs.highlightAll();

  if(game.path) {
    executeGame(game);
  }
}

async function executeGame(game) {
  const res = await fetch(`games/${game.path.hex}`); 
  const hex = await res.text();
  emulator.loadGame(hex); 
  emulator.executeGame(); 
}
