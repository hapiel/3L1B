// Game design by Daniel

const { Board, Led, Leds, Button, Fn } = require("johnny-five");
const board = new Board();

let led1;
let led2;
let led3;
let leds;

let button;

// state of the game
let gameState;

// which led is selected by user
let selected;

// for storing timeout Ids so they can be flushed
let timeoutIds = [];

board.on("ready", () => {
  led1 = new Led(4);
  led2 = new Led(3); 
  led3 = new Led(2);

  // testing different adding styles
  leds = new Leds([led1, led2, led3]);
  button = new Button({pin: 5, holdtime: 1000});

  button.on("hold", () => {
    console.log("game start");
    // in case some timeouts are still on
    stopTimeouts();

    startGame();
  });

  button.on("press", () => {
    if (gameState == "selection"){
      // stop leds
      stopTimeouts();
      leds.off();
      // increase selected
      selected = (selected + 1) % 3;
      // blink new led.
      blinkIncr(selected, rollBall);
    }
  });

});

function startGame(){
  gameState = "selection";
  selected = 0;
  leds.off();
  blinkIncr(selected, rollBall);
}

function rollBall(){
  gameState = "rolling";
  
  // random start position
  let ballPos = Math.floor(Math.random() * 3);
  // random starting speed
  let ballSpd = Math.random() * 15;
  let ballStopSpd = 1200;
  leds[ballPos].on();

  posIncr();

  function posIncr(){
    if (ballSpd > ballStopSpd) {
      gameEnd(ballPos);
      return;
    }
    leds.off();
    ballPos = (ballPos + 1) % 3;
    leds[ballPos].on();
    setTimeout(posIncr, ballSpd);
    ballSpd *= 1.1;
  }

}

function gameEnd(ballPos){
  if (ballPos == selected){
    win();
  } else {
    loose(ballPos);
  }
}

function win(){
  console.log("win!");
  // blink final ball pos
  leds[selected].blink(20);
  setTimeout(() => {
    leds[selected].stop(); 
    leds.off();}, 
    3000);
}

function loose(ballPos){
  console.log("loose :(");
  // blink final ball pos
  leds[ballPos].blink(20);
  setTimeout(() => {
    leds[ballPos].stop(); 
    leds.off();}, 
    3000);
  // blink selected 
  leds[selected].blink(200);
  setTimeout(() => {
    leds[selected].stop(); 
    leds.off();}, 
    3000);
  
}

/** The speed a led blinks increases, for for a duration of time
 * 
 */

function blinkIncr(led, 
    callback,
    time = 6,
    minOn = 20,
    maxOn = 400,
    minOff = 12,
    maxOff = 100){

  repeatOnOff();

  function repeatOnOff(step = 1){
    // check if we have reached the limit
    if(step > time) {
      if (callback){
        stayOn(500);
      }
      return;
    }

    // set on and off times
    let onTime = Fn.map(step, 0, time, maxOn, minOn);
    let offTime = Fn.map(step, 0, time, maxOff, minOff);

    // turn on, after some time turn off, and then repeat
    // store timeout ids in array.
    leds[led].on();
    timeoutIds.push(setTimeout(() => {leds[led].off();}, onTime));
    timeoutIds.push(setTimeout(() => {repeatOnOff(step + (1/step));}, offTime + onTime));

    function stayOn(duration){
      leds[led].on();
      setTimeout(callback, duration);
    }

  }

}

function stopTimeouts(){
  // clear timeouts
  timeoutIds.forEach(id => {
    clearTimeout(id);
  });
  // empty the array
  timeoutIds = [];
}

