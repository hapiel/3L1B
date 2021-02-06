gameInfo = {
  title: "Click when all on",
  description: "press the button when all lights are on",
};

const timers = [0,0,0];
const minTime = 5;
const maxTime = 60;

let gameState = "playing";
let timer;

// blink time
let bt = 4;

function loop(){

  if (gameState === "playing"){
    
    lights.forEach((light, i) => {
      if(frameCount > timers[i]){
        // toggle light
        lights[i] = !light;
      }
    });

    // reset timers when they surpass frameCount
    timers.forEach((timer, i) => {
      if(frameCount > timer){
        timers[i] = frameCount + Math.floor(Math.random()*maxTime) + minTime;
      }
    });

    if (button){
      // if all are on
      if(lights[0] && lights[1] && lights[2]){
        win();
      } else {
        loose();
      }
    }

  }

  if (gameState === "win"){
    allOff();
    let blinkState = Math.floor((frameCount - timer) / bt);
    lights[blinkState % 4] = true;
    if (blinkState > 18){
      play(60);
    }
  }

  if (gameState === "loose"){
    let blinkState = Math.floor((frameCount - timer) / bt);
    if (blinkState % 2 == 0){
      allOn();
    } else {
      allOff();
    }
    if (blinkState > 6){
      play(20);
    }
  }

}

function win(){
  timer = frameCount;
  gameState = "win";
}

function loose(){
  timer = frameCount;
  gameState = "loose";
}

function play(delay){
  allOff();
  timers[0] = frameCount + Math.floor(Math.random()*maxTime) + delay;
  timers[1] = frameCount + Math.floor(Math.random()*maxTime) + delay;
  timers[2] = frameCount + Math.floor(Math.random()*maxTime) + delay;
  gameState = "playing";
}