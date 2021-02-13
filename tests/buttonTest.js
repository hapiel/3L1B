const { Board, Button } = require("johnny-five"); 
const board = new Board(); 

//Test 1
board.on("ready", () => {
    const button = new Button(1);
    console.log(button.pin);
    console.log(button.downValue);

    button.on("down", () => {
        console.log("I pressed the button");
    });

    button.on("up", () => {
        console.log("I released the button");
    });

    button.on("hold", () => {
        console.log(`holding the button at ${Date.now()}`);
    })
});

//Test 2
// board.on("ready", () => {
//     const button = new Button({ pin: 1, invert: true });
//     console.log(button.pin);
//     console.log(button.downValue);

//     button.on("press", () => {
//         console.log("I pressed the button");
//     });

//     button.on("release", () => {
//         console.log("I released the button");
//     });
// });
