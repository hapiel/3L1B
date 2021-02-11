class BoardEmulator {
    on(state, callback) {
        callback();
    }

    // TODO: wait()
    // TODO: loop()
}

class LedEmulator {
    constructor(id) {
        this.id = id;
        this.el = document.querySelector(`#light-${id}`);
        this.intervalId = false;

        if(!this.el) {
            throw new Error(`Led with id ${id} does not exist`);
        }
    }

    blink(millis = 100) {

        // set millis to 100 when too low
        if (millis < 1){
            millis = 100;
        }
        
        this.intervalId = setInterval(() => {
            this.el.classList.toggle("on");
        }, millis);
    }

    on() {
        this.el.classList.add("on");
    }

    off() {
        this.el.classList.remove("on");
    }

    toggle(){
        this.el.classList.toggle("on");
    }

    stop(){
        clearInterval(this.intervalId);
    }
}

class LedsEmulator{
    // TODO: http://johnny-five.io/api/leds/
    // Daniel
}

class ButtonEmulator{
    // TODO: http://johnny-five.io/api/button/
}

const FnEmulator = {
    // TODO: https://github.com/rwaldron/johnny-five/blob/master/lib/fn.js
    // http://johnny-five.io/api/fn/
    // probably a bunch of functions can be copied out of the git
    // I already did that with map()
    // DANIEL :D

    map: (value, fromLow, fromHigh, toLow, toHigh) => ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0,

};

function require(packageName) {
    if(packageName != "johnny-five") {
        throw new Error("Only the johnny-five package is supported by this site");
    }

    return {
        Board: BoardEmulator,
        Led: LedEmulator,
        Leds: LedsEmulator,
        Button: ButtonEmulator,
        Fn: FnEmulator
    };
}