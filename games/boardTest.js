const { Board } = require("johnny-five"); 
const board = new Board(); 

board.on("donut", () => {
    console.log("function should not run");
});

board.on("ready", () => {
    console.time("waiting");
    board.wait(1000, () => {
        console.log("waiting has ended!");
    });
    console.timeEnd("waiting");

    let i = 0
    board.loop(500, (cancel) => {
        console.count("looping");

        if(i == 9) {
            cancel();
        }
        i++;
    });
});