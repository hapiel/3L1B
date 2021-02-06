// press the button when all lights are on
// As demonstrated by Paul

// game design by Bjorn van der haas

const { Board, Led, Leds, Button } = require("johnny-five");
const board = new Board();


let led1;
let led2;
let led3;
let leds;

// now I have an extra array for my leds, seems kinda redundant
// and I can't easily switch all at once. Can we make our own
// on/off variables?
const ledsOn = [false, false, false];

const ledTimeIDs = [];

let button;

const minTime = 200;
const maxTime = 1000;


board.on("ready", function() {
  led1 = new Led(4);
  led2 = new Led(3); 
  led3 = new Led(2);

  leds = new Leds([led1, led2, led3]);
  button = new Button(5);

  play();

  button.on("press", () =>{
    if (ledsOn[0] && ledsOn[1] && ledsOn[2]){
      win();
      
    } else {
      loose();
    }
  });

});

// toggle after random time, and then retrigger this function.
function randomBlink(led){
  ledTimeIDs[led] = setTimeout(
    randomBlink, 
    minTime + Math.random() * maxTime,
    led);
  leds[led].toggle();
  ledsOn[led] = !ledsOn[led];

}

function win(){
  console.log("win");
  clearTimeouts();
  leds.off();
  // why does setTimeout(leds.on(), 200) throw error: invalid callback?
  // win animation
  setTimeout(() => {led1.on();}, 100);
  setTimeout(() => {led2.on();}, 130);
  setTimeout(() => {led3.on();}, 160);
  setTimeout(() => {leds.off();}, 600);
  setTimeout(() => {led1.on();}, 700);
  setTimeout(() => {led2.on();}, 730);
  setTimeout(() => {led3.on();}, 760);
  setTimeout(() => {leds.off();}, 1200);
  setTimeout(() => {led1.on();}, 1300);
  setTimeout(() => {led2.on();}, 1330);
  setTimeout(() => {led3.on();}, 1360);
  setTimeout(play, 3000);
}

function loose(){
  console.log("loose");
  clearTimeouts();
  intervalID = setInterval(() => {leds.toggle();}, 50);
  setTimeout(clearInterval, 1000, intervalID);
  setTimeout(play, 1000);
}

function play(){
  // turn leds off
  leds.off();
  ledsOn[0] = false;
  ledsOn[1] = false;
  ledsOn[2] = false;
  // set initial timeout and start random blink
  setTimeout(randomBlink, Math.random() * maxTime, 0);
  setTimeout(randomBlink, Math.random() * maxTime, 1);
  setTimeout(randomBlink, Math.random() * maxTime, 2);
}

function clearTimeouts(){
  clearTimeout(ledTimeIDs[0]);
  clearTimeout(ledTimeIDs[1]);
  clearTimeout(ledTimeIDs[2]);
}