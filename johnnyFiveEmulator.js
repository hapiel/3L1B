class BoardEmulator {
    constructor() {
        this.intervalId = false;
    }

    on(state, callback) {
        if(state == "ready") {
            const boundCb = callback.bind(this);
            boundCb();
        }
    }

    loop(millis, callback) {
        this.intervalId = setInterval(() => {
            callback(() => this.cancelLoop());
        }, millis);
    }

    cancelLoop() {
        clearInterval(this.intervalId);
    }

    //NOTE: jonny-five will improve it's temporal functionality sometime in the future
    wait(millis, callback) {
        setTimeout(callback, millis);
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

class LedsEmulator {
    constructor(numsOrObjects) {

        this.objectList = [];
        numsOrObjects.forEach(e => {
            if (typeof e == "object") {
                this.objectList.push(e);
            }
            if (typeof e == "number"){
                this.objectList.push(new LedEmulator(e));
            }
        });

        this.objectList.forEach((obj, n )=> {
            this[n] = obj;
        });

        this.length = this.objectList.length;
    }

    blink(millis = 100) {
        this.objectList.forEach( obj => {
            obj.blink(millis);
        });
    }

    on() {
        this.objectList.forEach( obj => {
            obj.on();
        });
    }

    off() {
        this.objectList.forEach( obj => {
            obj.off();
        });
    }

    toggle(){
        this.objectList.forEach( obj => {
            obj.toggle();
        });
    }

    stop(){
        this.objectList.forEach( obj => {
            obj.stop();
        });
    }

    [Symbol.iterator] = Array.prototype[Symbol.iterator];
}


class ButtonEmulator{
    constructor(init) {
        //TODO: check what happens if no arguments are passed to a button in j5
        this.id = FnEmulator.uid();
        this.pin = init.pin || init;
        this.holdtime = init.holdtime || 500;
        this.downValue = 0;
        this.upValue = 1;
        this.el = document.querySelector("#button");
        this.timeoutId = false;

        if(init.invert || init.isPullup) {
            this.downValue = 1;
            this.upValue = 0;
        }
    }

    on(state, callback) {
        switch(state) {
            case "down":
            case "press":
                this.el.addEventListener("mousedown", callback);
                break;
            case "up":
            case "release":
                this.el.addEventListener("mouseup", callback);
                break;
            case "hold":
                this.el.addEventListener("mousedown", (e) => { this.holdDetection(callback) });
                this.el.addEventListener("mouseup", () => { this.cancelHoldDetection() });
                break;
        }
    }

    holdDetection(callback) {
        this.timeoutId = setTimeout(() => {
            callback();
            this.holdDetection(callback);
        }, this.holdtime);
    }

    cancelHoldDetection() {
        clearTimeout(this.timeoutId);
    }
}

const { ceil, max, min, PI } = Math;

const FnEmulator = {
    // based on https://github.com/rwaldron/johnny-five/blob/master/lib/fn.js

    map:    (value, fromLow, fromHigh, toLow, toHigh) => ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0,
    scale:  (value, fromLow, fromHigh, toLow, toHigh) => ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0,
    fmap:   (value, fromLow, fromHigh, toLow, toHigh) => {
            f32A[0] = (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
            return f32A[0];
        },
    fscale: (value, fromLow, fromHigh, toLow, toHigh) => {
            f32A[0] = (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
            return f32A[0];
        },

    constrain: (value, lower, upper) => min(upper, max(lower, value)),

    inRange: (value, lower, upper) => value >= lower && value <= upper,

    range: function(lower, upper, tick) {
            if (arguments.length === 1) {
                upper = lower - 1;
                lower = 0;
            }

            lower = lower || 0;
            upper = upper || 0;
            tick = tick || 1;

            const len = max(ceil((upper - lower) / tick), 0);
            let idx = 0;
            const range = [];

            while (idx <= len) {
                range[idx++] = lower;
                lower += tick;
            }
        
            return range;
        },
    
    sum: function sum(values) {
            let vals;
            if (Array.isArray(values)) {
                vals = values;
            } else {
                vals = [].slice.call(arguments);
            }
            return vals.reduce((accum, value) => accum + value, 0);
        },
    
    toFixed: (number, digits) => +(number || 0).toFixed(digits),

    bitSize: n => Math.round(Math.log2(n)),
    
    bv:       bit => 1 << bit,
    _BV:      bit => 1 << bit,
    bitValue: bit => 1 << bit,

    int16: (msb, lsb) => {
        const result = (msb << 8) | lsb;
    
        // Check highest bit for sign. If on, value is negative
        return result >> 15 ? ((result ^ 0xFFFF) + 1) * -1 : result;
    },

    uint16: (msb, lsb) => (msb << 8) | lsb,

    int24: (b16, b8, b0) => {
        const result = (b16 << 16) | (b8 << 8) | b0;
    
        // Check highest bit for sign. If on, value is negative
        return result >> 23 ? ((result ^ 0xFFFFFF) + 1) * -1 : result;
    },
    uint24: (b16, b8, b0) => (b16 << 16) | (b8 << 8) | b0,

    int32: (b24, b16, b8, b0) => {
        const result = (b24 << 24) | (b16 << 16) | (b8 << 8) | b0;
        // Check highest bit for sign. If on, value is negative
        return result >> 31 ? ((result ^ 0xFFFFFFFF) + 1) * -1 : result;
    },
    uint32: (b24, b16, b8, b0) => ((b24 << 24) | (b16 << 16) | (b8 << 8) | b0) >>> 0,

    uid: () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, chr => {
        const rnd = Math.random() * 16 | 0;
        return (chr === "x" ? rnd : (rnd & 0x3 | 0x8)).toString(16);
    }).toUpperCase(),

    RAD_TO_DEG: 180 / PI,
    DEG_TO_RAD: PI / 180,
    TAU: 2 * PI,

};

/**
 * The following generates functions and constants for utility when working
 * with binary numbers:
 *   - Fn.POW_2_0 through Fn.POW_2_53
 *   - Fn.u4(value) through Fn.u32(value)
 *   - Fn.s4(value) through Fn.s32(value)
 */
const POW = "POW_2_";
const U = "u";
const S = "s";
const MAX = FnEmulator.bitSize(Number.MAX_SAFE_INTEGER) + 1;
const bitSizes = [ 4, 8, 10, 12, 16, 20, 24, 32 ];

/**
 * Generate "constants" that represent powers of 2. Available for powers
 * 0 through 53.
 * @example
 * Fn.POW_2_17; // -> 131072
 */
for (let i = 0; i < MAX; i++) {
    FnEmulator[POW + i] = 2 ** i;
}

bitSizes.forEach(bitSize => {
    const decimal = FnEmulator[POW + bitSize];
    const half = decimal / 2 >>> 0;
    const halfMinusOne = half - 1;

    /**
   * The function Fn["u" + bitSize] will constrain a value to an unsigned
   * value of that bit size.
   *
   * @param {Number} value
   * @return {Number} constrained to an unsigned int
   * @example
   * Fn.u8(255); // --> 255
   * Fn.u8(256); // --> 255
   * Fn.u8(-255); // --> 0
   * Fn.u8(-254); // -- 1
   */
    FnEmulator[U + bitSize] = value => {
    if (value < 0) {
        value += decimal;
    }
    return FnEmulator.constrain(value, 0, decimal - 1);
    };

    /**
   * The function Fn["s" + bitSize] will constrain a value to a signed value
   * of that bit size. Remember that, e.g., range for signed 8-bit numbers
   * is -128 to 127.
   *
   * @param {Number} value
   * @return {Number} constrained to a SIGNED integer in bitsize range
   * @example
   * Fn.s8(100); // --> 100
   * Fn.s8(128); // --> -128
   * Fn.s8(127); // --> 127
   * Fn.s8(255); // --> -1
   */
    FnEmulator[S + bitSize] = value => {
    if (value > halfMinusOne) {
        value -= decimal;
    }
    return FnEmulator.constrain(value, -half, halfMinusOne);
    };
});

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