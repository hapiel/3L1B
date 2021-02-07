const { Board, Led, Fn } = require("johnny-five");
const board = new Board();

// Initialisation outside of board so you can controll the led object from the console
let led1;
let led2;
let led3;

board.on("ready", () => {

  // Create a standard led component instance
  led1 = new Led(0);
  led2 = new Led(1);
  led3 = new Led(2);

  // "blink" the led in 500ms
  // on-off phase periods
  led1.blink(100);
  led2.blink(100);
  // led3.blink(0);
});