// game design by Bjorn van der haas

gameInfo = {
  title: "Lightspeed",
  description: "Lightspeed, designed by Bjorn for arduino. <br> I ported my own arduino code to js.",
}

let ledDelay = 60;
let decr = 2;
let incr = 3;

let lightActive = 1;
let delayTime = 20;

let timer = 0;

let gameState = "playing";
let blinkCounter = 0;

// blink time
let bt = 3;

play();

function loop(){
  
  if(gameState === "playing") {

    // set next light every delayTime frames.
    if (timer < frameCount - delayTime){
      lightActive ++;
      lightActive = lightActive % 3;
      timer = frameCount;
    }

    // check if button is pressed at right time
    if(buttonPressed){
      if(lights[1]){
        win();
      } else {
        loose();
      }
    }

    // set the lights
    allOff();
    lights[lightActive] = true;
  }
  
  if(gameState === "win") {
    if(timer < frameCount - bt) {
      lights[1] = true;
    }  else {
      lights[1] = false;
    }
    if (timer < frameCount - bt * 2) {
      timer = frameCount;
      blinkCounter++;
      if (blinkCounter > 2) {
        play();
      }
    }
  }

  if(gameState === "loose") {
    allOff();
    if(timer > frameCount - bt ) {
      lights[2] = true;
    } else if (timer > frameCount - bt * 2){
      lights[1] = true;
    } else if (timer > frameCount - bt * 3){
      lights[0] = true;
    } else {
      timer = frameCount;
      blinkCounter ++;
      if(blinkCounter > 3){
        play();
      }
    }
  }

}

function win() {
  allOff();
  delayTime -= decr;
  gameState = "win";
  blinkCounter = 0;
  timer = frameCount;
}

function loose(){
  allOff();
  delayTime += incr;
  gameState = "loose";
  blinkCounter = 0;
  timer = frameCount;
}

function play(){
  allOff();
  gameState = "playing";
  lightActive = Math.floor(Math.random() * 3);
}