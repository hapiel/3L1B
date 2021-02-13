// game design by Bjorn van der haas

const { Board, Led, Leds, Button } = require("johnny-five");
const board = new Board();


let led1;
let led2;
let led3;
let leds;

let button;

let lightActive = 1;
let timer = 0;
let blinkCounter = 0;
let gameState = "playing";
let frameCount = 0;
// blink time
let bt = 5;
// starting delay time
let delayTime = 20;
// incr en decr times
let decr = 2;
let incr = 3;

board.on("ready", function() {
  led1 = new Led(4);
  led2 = new Led(3);
  led3 = new Led(2);

  // testing different adding styles
  leds = new Leds([led1, led2, 2]);
  button = new Button(5);


  button.on("press", () => {
    if (lightActive == 1) {
      win();
    } else {
      loose();
    }
  });
  
  this.loop(10, () => {
    if(gameState ==="playing"){
        // set next light every delayTime frames.
      if (timer < frameCount - delayTime){
        lightActive ++;
        lightActive = lightActive % 3;
        timer = frameCount;
      }

      leds.off();
      leds[lightActive].on();
    }

    if(gameState === "win") {
      if(timer < frameCount - bt) {
        led2.on();
      }  else {
        led2.off();
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
      leds.off();
      if(timer > frameCount - bt ) {
        led3.on();
      } else if (timer > frameCount - bt * 2){
        led2.on();
      } else if (timer > frameCount - bt * 3){
        led1.on();
      } else {
        timer = frameCount;
        blinkCounter ++;
        if(blinkCounter > 3){
          play();
        }
      }
    }


    frameCount++;
  });

});

function win() {
  leds.off();
  delayTime -= decr;
  gameState = "win";
  blinkCounter = 0;
  timer = frameCount;
}

function loose(){
  leds.off();
  delayTime += incr;
  gameState = "loose";
  blinkCounter = 0;
  timer = frameCount;
}

function play(){
  leds.off();
  gameState = "playing";
  lightActive = Math.floor(Math.random() * 3);
}