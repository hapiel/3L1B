const { Board, Led, Leds, Fn, Button } = require("johnny-five");
const board = new Board();

let led1;
let led2;
let led3;
let leds;

let button;

board.on("ready", () => {

  // Create a standard led component instance
  led1 = new Led(0);
  led2 = new Led(1);
  led3 = new Led(2);

  leds = new Leds([led1,1,2]);

  button = new Button(5);

  // button.on("press", () => {
  //   leds.stop();
  // });

  // "blink" the led in 500ms
  // on-off phase periods
  led1.blink(100);
  led2.blink(100);
    // leds.blink();
  // led3.blink(0);
});