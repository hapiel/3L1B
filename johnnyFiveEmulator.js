class BoardEmulator {
    on(state, callback) {
        callback();
    }
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

    blink(millis) {
        this.intervalId = setInterval(() => {
            this.el.classList.toggle("on");
        }, millis)
    }
}

function require(packageName) {
    if(packageName != "johnny-five") {
        throw new Error("Only the johnny-five package is supported by this site");
    }

    return {
        Board: BoardEmulator,
        Led: LedEmulator,
    }
}