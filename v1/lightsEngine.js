


// variables to be used in game
let lights = [false, false, false];
let button = false;
// only show true for 1 frame
let buttonPressed = false;
let buttonReleased = false;

let frameCount = 0;

// the value of the button in the previous frame. 
// Can't be used in a game, use buttonPressed & buttonReleased instead.
let lastButton = false;

// light elements in html
const light0 = document.getElementById("light-0");
const light1 = document.getElementById("light-1");
const light2 = document.getElementById("light-2");

function allOn(){
  lights[0] = true;
  lights[1] = true;
  lights[2] = true;
}

function allOff(){
  lights[0] = false;
  lights[1] = false;
  lights[2] = false;
}

/** updateLights() will add on/off classes to the light elements
 * depending on lights[n] being true or false.
 */

function updateLights(){
  if (lights[0]) light0.className = "light on";
  else light0.className = "light off";

  if (lights[1]) light1.className = "light on";
  else light1.className = "light off";
  
  if (lights[2]) light2.className = "light on";
  else light2.className = "light off";
}

// button down, set button to true
document.getElementById("button").addEventListener("mousedown", () => {button = true;});
// button down, set button to false
document.addEventListener("mouseup", () => {button = false;});

/** updateButton() will turn buttonPressed and buttonReleased true or false
 * depending on lastButton vs button, and will reset lastButton = button.
 */

function updateButton(){
  // new click
  if (button && !lastButton){
    buttonPressed = true;
    buttonReleased = false;
  }
  // new release
  if (!button && lastButton){
    buttonReleased = true;
    buttonPressed = false;
  }
  if (button === lastButton){
    buttonPressed = false;
    buttonReleased = false;
  }
  lastButton = button;
}



// request the first frame
window.requestAnimationFrame(masterLoop);

// the loop controlling all critical aspects of the game
function masterLoop(){
  updateButton();
  // only run if loop exists
  if (typeof loop === "function") {
    loop();
    // first frame
    if(frameCount === 0){
      document.getElementById("title").innerHTML = gameInfo.title;
      document.getElementById("description").innerHTML = gameInfo.description;
      const a = document.createElement("a");
      a.href = s.src;
      a.innerHTML = "source of this game";
      document.getElementById("src").appendChild(a);
    }
    frameCount ++;
  }
  updateLights();
  
  // request the next frame. Should run around 60fps
  window.requestAnimationFrame(masterLoop);
}

// load js file depending on url parameter
const urlParams = new URLSearchParams(window.location.search);
const s = document.createElement("script");
s.type = "text/javascript";
s.src = urlParams.get("game") + ".js";
document.getElementsByTagName("head")[0].appendChild(s);

// dropdown menu
document.getElementById("game-list").addEventListener("change", (e) =>{
  // change url parameter to select value
  window.location.search = "?game=" + e.target.value;
});
