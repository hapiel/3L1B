const { Board, Leds } = require("johnny-five"); 
const board = new Board(); 

board.on("ready", () => {
    const leds = new Leds([0, 1, 2]);
    leds.blink();
    leds[0].stop();

    for(let led of leds) {
        console.log(led)
    }
});