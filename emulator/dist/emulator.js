// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../../node_modules/avr8js/dist/esm/cpu/interrupt.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.avrInterrupt = avrInterrupt;

/**
 * AVR-8 Interrupt Handling
 * Part of AVR8js
 * Reference: http://ww1.microchip.com/downloads/en/devicedoc/atmel-0856-avr-instruction-set-manual.pdf
 *
 * Copyright (C) 2019, Uri Shaked
 */
function avrInterrupt(cpu, addr) {
  const sp = cpu.dataView.getUint16(93, true);
  cpu.data[sp] = cpu.pc & 0xff;
  cpu.data[sp - 1] = cpu.pc >> 8 & 0xff;

  if (cpu.pc22Bits) {
    cpu.data[sp - 2] = cpu.pc >> 16 & 0xff;
  }

  cpu.dataView.setUint16(93, sp - (cpu.pc22Bits ? 3 : 2), true);
  cpu.data[95] &= 0x7f; // clear global interrupt flag

  cpu.cycles += 2;
  cpu.pc = addr;
}
},{}],"../../node_modules/avr8js/dist/esm/cpu/cpu.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CPU = void 0;

var _interrupt = require("./interrupt");

/**
 * AVR 8 CPU data structures
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */
const registerSpace = 0x100;

class CPU {
  constructor(progMem, sramBytes = 8192) {
    this.progMem = progMem;
    this.sramBytes = sramBytes;
    this.data = new Uint8Array(this.sramBytes + registerSpace);
    this.data16 = new Uint16Array(this.data.buffer);
    this.dataView = new DataView(this.data.buffer);
    this.progBytes = new Uint8Array(this.progMem.buffer);
    this.readHooks = [];
    this.writeHooks = [];
    this.pendingInterrupts = [];
    this.clockEvents = [];
    this.pc22Bits = this.progBytes.length > 0x20000; // This lets the Timer Compare output override GPIO pins:

    this.gpioTimerHooks = [];
    this.pc = 0;
    this.cycles = 0;
    this.nextInterrupt = -1;
    this.nextClockEvent = 0;
    this.reset();
  }

  reset() {
    this.data.fill(0);
    this.SP = this.data.length - 1;
    this.pendingInterrupts.splice(0, this.pendingInterrupts.length);
    this.nextInterrupt = -1;
  }

  readData(addr) {
    if (addr >= 32 && this.readHooks[addr]) {
      return this.readHooks[addr](addr);
    }

    return this.data[addr];
  }

  writeData(addr, value) {
    const hook = this.writeHooks[addr];

    if (hook) {
      if (hook(value, this.data[addr], addr)) {
        return;
      }
    }

    this.data[addr] = value;
  }

  get SP() {
    return this.dataView.getUint16(93, true);
  }

  set SP(value) {
    this.dataView.setUint16(93, value, true);
  }

  get SREG() {
    return this.data[95];
  }

  get interruptsEnabled() {
    return this.SREG & 0x80 ? true : false;
  }

  updateNextInterrupt() {
    this.nextInterrupt = this.pendingInterrupts.findIndex(item => !!item);
  }

  setInterruptFlag(interrupt) {
    const {
      flagRegister,
      flagMask,
      enableRegister,
      enableMask
    } = interrupt;

    if (interrupt.inverseFlag) {
      this.data[flagRegister] &= ~flagMask;
    } else {
      this.data[flagRegister] |= flagMask;
    }

    if (this.data[enableRegister] & enableMask) {
      this.queueInterrupt(interrupt);
    }
  }

  updateInterruptEnable(interrupt, registerValue) {
    const {
      enableMask,
      flagRegister,
      flagMask
    } = interrupt;

    if (registerValue & enableMask) {
      if (this.data[flagRegister] & flagMask) {
        this.queueInterrupt(interrupt);
      }
    } else {
      this.clearInterrupt(interrupt, false);
    }
  }

  queueInterrupt(interrupt) {
    this.pendingInterrupts[interrupt.address] = interrupt;
    this.updateNextInterrupt();
  }

  clearInterrupt({
    address,
    flagRegister,
    flagMask
  }, clearFlag = true) {
    delete this.pendingInterrupts[address];

    if (clearFlag) {
      this.data[flagRegister] &= ~flagMask;
    }

    this.updateNextInterrupt();
  }

  clearInterruptByFlag(interrupt, registerValue) {
    const {
      flagRegister,
      flagMask
    } = interrupt;

    if (registerValue & flagMask) {
      this.data[flagRegister] &= ~flagMask;
      this.clearInterrupt(interrupt);
    }
  }

  addClockEvent(callback, cycles) {
    const entry = {
      cycles: this.cycles + Math.max(1, cycles),
      callback
    }; // Add the new entry while keeping the array sorted

    const {
      clockEvents
    } = this;

    if (!clockEvents.length || clockEvents[clockEvents.length - 1].cycles <= entry.cycles) {
      clockEvents.push(entry);
    } else if (clockEvents[0].cycles >= entry.cycles) {
      clockEvents.unshift(entry);
    } else {
      for (let i = 1; i < clockEvents.length; i++) {
        if (clockEvents[i].cycles >= entry.cycles) {
          clockEvents.splice(i, 0, entry);
          break;
        }
      }
    }

    this.nextClockEvent = this.clockEvents[0].cycles;
    return callback;
  }

  updateClockEvent(callback, cycles) {
    if (this.clearClockEvent(callback)) {
      this.addClockEvent(callback, cycles);
      return true;
    }

    return false;
  }

  clearClockEvent(callback) {
    var _a, _b;

    const index = this.clockEvents.findIndex(item => item.callback === callback);

    if (index >= 0) {
      this.clockEvents.splice(index, 1);
      this.nextClockEvent = (_b = (_a = this.clockEvents[0]) === null || _a === void 0 ? void 0 : _a.cycles) !== null && _b !== void 0 ? _b : 0;
      return true;
    }

    return false;
  }

  tick() {
    var _a, _b, _c;

    const {
      nextClockEvent,
      clockEvents
    } = this;

    if (nextClockEvent && nextClockEvent <= this.cycles) {
      (_a = clockEvents.shift()) === null || _a === void 0 ? void 0 : _a.callback();
      this.nextClockEvent = (_c = (_b = clockEvents[0]) === null || _b === void 0 ? void 0 : _b.cycles) !== null && _c !== void 0 ? _c : 0;
    }

    const {
      nextInterrupt
    } = this;

    if (this.interruptsEnabled && nextInterrupt >= 0) {
      const interrupt = this.pendingInterrupts[nextInterrupt];
      (0, _interrupt.avrInterrupt)(this, interrupt.address);

      if (!interrupt.constant) {
        this.clearInterrupt(interrupt);
      }
    }
  }

}

exports.CPU = CPU;
},{"./interrupt":"../../node_modules/avr8js/dist/esm/cpu/interrupt.js"}],"../../node_modules/avr8js/dist/esm/cpu/instruction.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.avrInstruction = avrInstruction;

/**
 * AVR-8 Instruction Simulation
 * Part of AVR8js
 *
 * Reference: http://ww1.microchip.com/downloads/en/devicedoc/atmel-0856-avr-instruction-set-manual.pdf
 *
 * Instruction timing is currently based on ATmega328p (see the Instruction Set Summary at the end of
 * the datasheet)
 *
 * Copyright (C) 2019, 2020 Uri Shaked
 */
function isTwoWordInstruction(opcode) {
  return (
    /* LDS */
    (opcode & 0xfe0f) === 0x9000 ||
    /* STS */
    (opcode & 0xfe0f) === 0x9200 ||
    /* CALL */
    (opcode & 0xfe0e) === 0x940e ||
    /* JMP */
    (opcode & 0xfe0e) === 0x940c
  );
}

function avrInstruction(cpu) {
  const opcode = cpu.progMem[cpu.pc];

  if ((opcode & 0xfc00) === 0x1c00) {
    /* ADC, 0001 11rd dddd rrrr */
    const d = cpu.data[(opcode & 0x1f0) >> 4];
    const r = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    const sum = d + r + (cpu.data[95] & 1);
    const R = sum & 255;
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= (R ^ r) & (d ^ R) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= sum & 256 ? 1 : 0;
    sreg |= 1 & (d & r | r & ~R | ~R & d) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfc00) === 0xc00) {
    /* ADD, 0000 11rd dddd rrrr */
    const d = cpu.data[(opcode & 0x1f0) >> 4];
    const r = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    const R = d + r & 255;
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= (R ^ r) & (R ^ d) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= d + r & 256 ? 1 : 0;
    sreg |= 1 & (d & r | r & ~R | ~R & d) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xff00) === 0x9600) {
    /* ADIW, 1001 0110 KKdd KKKK */
    const addr = 2 * ((opcode & 0x30) >> 4) + 24;
    const value = cpu.dataView.getUint16(addr, true);
    const R = value + (opcode & 0xf | (opcode & 0xc0) >> 2) & 0xffff;
    cpu.dataView.setUint16(addr, R, true);
    let sreg = cpu.data[95] & 0xe0;
    sreg |= R ? 0 : 2;
    sreg |= 0x8000 & R ? 4 : 0;
    sreg |= ~value & R & 0x8000 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= ~R & value & 0x8000 ? 1 : 0;
    cpu.data[95] = sreg;
    cpu.cycles++;
  } else if ((opcode & 0xfc00) === 0x2000) {
    /* AND, 0010 00rd dddd rrrr */
    const R = cpu.data[(opcode & 0x1f0) >> 4] & cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xf000) === 0x7000) {
    /* ANDI, 0111 KKKK dddd KKKK */
    const R = cpu.data[((opcode & 0xf0) >> 4) + 16] & (opcode & 0xf | (opcode & 0xf00) >> 4);
    cpu.data[((opcode & 0xf0) >> 4) + 16] = R;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfe0f) === 0x9405) {
    /* ASR, 1001 010d dddd 0101 */
    const value = cpu.data[(opcode & 0x1f0) >> 4];
    const R = value >>> 1 | 128 & value;
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xe0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= value & 1;
    sreg |= sreg >> 2 & 1 ^ sreg & 1 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xff8f) === 0x9488) {
    /* BCLR, 1001 0100 1sss 1000 */
    cpu.data[95] &= ~(1 << ((opcode & 0x70) >> 4));
  } else if ((opcode & 0xfe08) === 0xf800) {
    /* BLD, 1111 100d dddd 0bbb */
    const b = opcode & 7;
    const d = (opcode & 0x1f0) >> 4;
    cpu.data[d] = ~(1 << b) & cpu.data[d] | (cpu.data[95] >> 6 & 1) << b;
  } else if ((opcode & 0xfc00) === 0xf400) {
    /* BRBC, 1111 01kk kkkk ksss */
    if (!(cpu.data[95] & 1 << (opcode & 7))) {
      cpu.pc = cpu.pc + (((opcode & 0x1f8) >> 3) - (opcode & 0x200 ? 0x40 : 0));
      cpu.cycles++;
    }
  } else if ((opcode & 0xfc00) === 0xf000) {
    /* BRBS, 1111 00kk kkkk ksss */
    if (cpu.data[95] & 1 << (opcode & 7)) {
      cpu.pc = cpu.pc + (((opcode & 0x1f8) >> 3) - (opcode & 0x200 ? 0x40 : 0));
      cpu.cycles++;
    }
  } else if ((opcode & 0xff8f) === 0x9408) {
    /* BSET, 1001 0100 0sss 1000 */
    cpu.data[95] |= 1 << ((opcode & 0x70) >> 4);
  } else if ((opcode & 0xfe08) === 0xfa00) {
    /* BST, 1111 101d dddd 0bbb */
    const d = cpu.data[(opcode & 0x1f0) >> 4];
    const b = opcode & 7;
    cpu.data[95] = cpu.data[95] & 0xbf | (d >> b & 1 ? 0x40 : 0);
  } else if ((opcode & 0xfe0e) === 0x940e) {
    /* CALL, 1001 010k kkkk 111k kkkk kkkk kkkk kkkk */
    const k = cpu.progMem[cpu.pc + 1] | (opcode & 1) << 16 | (opcode & 0x1f0) << 13;
    const ret = cpu.pc + 2;
    const sp = cpu.dataView.getUint16(93, true);
    const {
      pc22Bits
    } = cpu;
    cpu.data[sp] = 255 & ret;
    cpu.data[sp - 1] = ret >> 8 & 255;

    if (pc22Bits) {
      cpu.data[sp - 2] = ret >> 16 & 255;
    }

    cpu.dataView.setUint16(93, sp - (pc22Bits ? 3 : 2), true);
    cpu.pc = k - 1;
    cpu.cycles += pc22Bits ? 4 : 3;
  } else if ((opcode & 0xff00) === 0x9800) {
    /* CBI, 1001 1000 AAAA Abbb */
    const A = opcode & 0xf8;
    const b = opcode & 7;
    const R = cpu.readData((A >> 3) + 32);
    cpu.writeData((A >> 3) + 32, R & ~(1 << b));
  } else if ((opcode & 0xfe0f) === 0x9400) {
    /* COM, 1001 010d dddd 0000 */
    const d = (opcode & 0x1f0) >> 4;
    const R = 255 - cpu.data[d];
    cpu.data[d] = R;
    let sreg = cpu.data[95] & 0xe1 | 1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfc00) === 0x1400) {
    /* CP, 0001 01rd dddd rrrr */
    const val1 = cpu.data[(opcode & 0x1f0) >> 4];
    const val2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    const R = val1 - val2;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= 0 !== ((val1 ^ val2) & (val1 ^ R) & 128) ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= val2 > val1 ? 1 : 0;
    sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfc00) === 0x400) {
    /* CPC, 0000 01rd dddd rrrr */
    const arg1 = cpu.data[(opcode & 0x1f0) >> 4];
    const arg2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    let sreg = cpu.data[95];
    const r = arg1 - arg2 - (sreg & 1);
    sreg = sreg & 0xc0 | (!r && sreg >> 1 & 1 ? 2 : 0) | (arg2 + (sreg & 1) > arg1 ? 1 : 0);
    sreg |= 128 & r ? 4 : 0;
    sreg |= (arg1 ^ arg2) & (arg1 ^ r) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= 1 & (~arg1 & arg2 | arg2 & r | r & ~arg1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xf000) === 0x3000) {
    /* CPI, 0011 KKKK dddd KKKK */
    const arg1 = cpu.data[((opcode & 0xf0) >> 4) + 16];
    const arg2 = opcode & 0xf | (opcode & 0xf00) >> 4;
    const r = arg1 - arg2;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= r ? 0 : 2;
    sreg |= 128 & r ? 4 : 0;
    sreg |= (arg1 ^ arg2) & (arg1 ^ r) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= arg2 > arg1 ? 1 : 0;
    sreg |= 1 & (~arg1 & arg2 | arg2 & r | r & ~arg1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfc00) === 0x1000) {
    /* CPSE, 0001 00rd dddd rrrr */
    if (cpu.data[(opcode & 0x1f0) >> 4] === cpu.data[opcode & 0xf | (opcode & 0x200) >> 5]) {
      const nextOpcode = cpu.progMem[cpu.pc + 1];
      const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
      cpu.pc += skipSize;
      cpu.cycles += skipSize;
    }
  } else if ((opcode & 0xfe0f) === 0x940a) {
    /* DEC, 1001 010d dddd 1010 */
    const value = cpu.data[(opcode & 0x1f0) >> 4];
    const R = value - 1;
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= 128 === value ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if (opcode === 0x9519) {
    /* EICALL, 1001 0101 0001 1001 */
    const retAddr = cpu.pc + 1;
    const sp = cpu.dataView.getUint16(93, true);
    const eind = cpu.data[0x5c];
    cpu.data[sp] = retAddr & 255;
    cpu.data[sp - 1] = retAddr >> 8 & 255;
    cpu.data[sp - 2] = retAddr >> 16 & 255;
    cpu.dataView.setUint16(93, sp - 3, true);
    cpu.pc = (eind << 16 | cpu.dataView.getUint16(30, true)) - 1;
    cpu.cycles += 3;
  } else if (opcode === 0x9419) {
    /* EIJMP, 1001 0100 0001 1001 */
    const eind = cpu.data[0x5c];
    cpu.pc = (eind << 16 | cpu.dataView.getUint16(30, true)) - 1;
    cpu.cycles++;
  } else if (opcode === 0x95d8) {
    /* ELPM, 1001 0101 1101 1000 */
    const rampz = cpu.data[0x5b];
    cpu.data[0] = cpu.progBytes[rampz << 16 | cpu.dataView.getUint16(30, true)];
    cpu.cycles += 2;
  } else if ((opcode & 0xfe0f) === 0x9006) {
    /* ELPM(REG), 1001 000d dddd 0110 */
    const rampz = cpu.data[0x5b];
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.progBytes[rampz << 16 | cpu.dataView.getUint16(30, true)];
    cpu.cycles += 2;
  } else if ((opcode & 0xfe0f) === 0x9007) {
    /* ELPM(INC), 1001 000d dddd 0111 */
    const rampz = cpu.data[0x5b];
    const i = cpu.dataView.getUint16(30, true);
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.progBytes[rampz << 16 | i];
    cpu.dataView.setUint16(30, i + 1, true);

    if (i === 0xffff) {
      cpu.data[0x5b] = (rampz + 1) % (cpu.progBytes.length >> 16);
    }

    cpu.cycles += 2;
  } else if ((opcode & 0xfc00) === 0x2400) {
    /* EOR, 0010 01rd dddd rrrr */
    const R = cpu.data[(opcode & 0x1f0) >> 4] ^ cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xff88) === 0x308) {
    /* FMUL, 0000 0011 0ddd 1rrr */
    const v1 = cpu.data[((opcode & 0x70) >> 4) + 16];
    const v2 = cpu.data[(opcode & 7) + 16];
    const R = v1 * v2 << 1;
    cpu.dataView.setUint16(0, R, true);
    cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & R ? 0 : 2) | (v1 * v2 & 0x8000 ? 1 : 0);
    cpu.cycles++;
  } else if ((opcode & 0xff88) === 0x380) {
    /* FMULS, 0000 0011 1ddd 0rrr */
    const v1 = cpu.dataView.getInt8(((opcode & 0x70) >> 4) + 16);
    const v2 = cpu.dataView.getInt8((opcode & 7) + 16);
    const R = v1 * v2 << 1;
    cpu.dataView.setInt16(0, R, true);
    cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & R ? 0 : 2) | (v1 * v2 & 0x8000 ? 1 : 0);
    cpu.cycles++;
  } else if ((opcode & 0xff88) === 0x388) {
    /* FMULSU, 0000 0011 1ddd 1rrr */
    const v1 = cpu.dataView.getInt8(((opcode & 0x70) >> 4) + 16);
    const v2 = cpu.data[(opcode & 7) + 16];
    const R = v1 * v2 << 1;
    cpu.dataView.setInt16(0, R, true);
    cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & R ? 2 : 0) | (v1 * v2 & 0x8000 ? 1 : 0);
    cpu.cycles++;
  } else if (opcode === 0x9509) {
    /* ICALL, 1001 0101 0000 1001 */
    const retAddr = cpu.pc + 1;
    const sp = cpu.dataView.getUint16(93, true);
    const {
      pc22Bits
    } = cpu;
    cpu.data[sp] = retAddr & 255;
    cpu.data[sp - 1] = retAddr >> 8 & 255;

    if (pc22Bits) {
      cpu.data[sp - 2] = retAddr >> 16 & 255;
    }

    cpu.dataView.setUint16(93, sp - (pc22Bits ? 3 : 2), true);
    cpu.pc = cpu.dataView.getUint16(30, true) - 1;
    cpu.cycles += pc22Bits ? 3 : 2;
  } else if (opcode === 0x9409) {
    /* IJMP, 1001 0100 0000 1001 */
    cpu.pc = cpu.dataView.getUint16(30, true) - 1;
    cpu.cycles++;
  } else if ((opcode & 0xf800) === 0xb000) {
    /* IN, 1011 0AAd dddd AAAA */
    const i = cpu.readData((opcode & 0xf | (opcode & 0x600) >> 5) + 32);
    cpu.data[(opcode & 0x1f0) >> 4] = i;
  } else if ((opcode & 0xfe0f) === 0x9403) {
    /* INC, 1001 010d dddd 0011 */
    const d = cpu.data[(opcode & 0x1f0) >> 4];
    const r = d + 1 & 255;
    cpu.data[(opcode & 0x1f0) >> 4] = r;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= r ? 0 : 2;
    sreg |= 128 & r ? 4 : 0;
    sreg |= 127 === d ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfe0e) === 0x940c) {
    /* JMP, 1001 010k kkkk 110k kkkk kkkk kkkk kkkk */
    cpu.pc = (cpu.progMem[cpu.pc + 1] | (opcode & 1) << 16 | (opcode & 0x1f0) << 13) - 1;
    cpu.cycles += 2;
  } else if ((opcode & 0xfe0f) === 0x9206) {
    /* LAC, 1001 001r rrrr 0110 */
    const r = (opcode & 0x1f0) >> 4;
    const clear = cpu.data[r];
    const value = cpu.readData(cpu.dataView.getUint16(30, true));
    cpu.writeData(cpu.dataView.getUint16(30, true), value & 255 - clear);
    cpu.data[r] = value;
  } else if ((opcode & 0xfe0f) === 0x9205) {
    /* LAS, 1001 001r rrrr 0101 */
    const r = (opcode & 0x1f0) >> 4;
    const set = cpu.data[r];
    const value = cpu.readData(cpu.dataView.getUint16(30, true));
    cpu.writeData(cpu.dataView.getUint16(30, true), value | set);
    cpu.data[r] = value;
  } else if ((opcode & 0xfe0f) === 0x9207) {
    /* LAT, 1001 001r rrrr 0111 */
    const r = cpu.data[(opcode & 0x1f0) >> 4];
    const R = cpu.readData(cpu.dataView.getUint16(30, true));
    cpu.writeData(cpu.dataView.getUint16(30, true), r ^ R);
    cpu.data[(opcode & 0x1f0) >> 4] = R;
  } else if ((opcode & 0xf000) === 0xe000) {
    /* LDI, 1110 KKKK dddd KKKK */
    cpu.data[((opcode & 0xf0) >> 4) + 16] = opcode & 0xf | (opcode & 0xf00) >> 4;
  } else if ((opcode & 0xfe0f) === 0x9000) {
    /* LDS, 1001 000d dddd 0000 kkkk kkkk kkkk kkkk */
    cpu.cycles++;
    const value = cpu.readData(cpu.progMem[cpu.pc + 1]);
    cpu.data[(opcode & 0x1f0) >> 4] = value;
    cpu.pc++;
  } else if ((opcode & 0xfe0f) === 0x900c) {
    /* LDX, 1001 000d dddd 1100 */
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(26, true));
  } else if ((opcode & 0xfe0f) === 0x900d) {
    /* LDX(INC), 1001 000d dddd 1101 */
    const x = cpu.dataView.getUint16(26, true);
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(x);
    cpu.dataView.setUint16(26, x + 1, true);
  } else if ((opcode & 0xfe0f) === 0x900e) {
    /* LDX(DEC), 1001 000d dddd 1110 */
    const x = cpu.dataView.getUint16(26, true) - 1;
    cpu.dataView.setUint16(26, x, true);
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(x);
  } else if ((opcode & 0xfe0f) === 0x8008) {
    /* LDY, 1000 000d dddd 1000 */
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(28, true));
  } else if ((opcode & 0xfe0f) === 0x9009) {
    /* LDY(INC), 1001 000d dddd 1001 */
    const y = cpu.dataView.getUint16(28, true);
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(y);
    cpu.dataView.setUint16(28, y + 1, true);
  } else if ((opcode & 0xfe0f) === 0x900a) {
    /* LDY(DEC), 1001 000d dddd 1010 */
    const y = cpu.dataView.getUint16(28, true) - 1;
    cpu.dataView.setUint16(28, y, true);
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(y);
  } else if ((opcode & 0xd208) === 0x8008 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
    /* LDDY, 10q0 qq0d dddd 1qqq */
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(28, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8));
  } else if ((opcode & 0xfe0f) === 0x8000) {
    /* LDZ, 1000 000d dddd 0000 */
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(30, true));
  } else if ((opcode & 0xfe0f) === 0x9001) {
    /* LDZ(INC), 1001 000d dddd 0001 */
    const z = cpu.dataView.getUint16(30, true);
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(z);
    cpu.dataView.setUint16(30, z + 1, true);
  } else if ((opcode & 0xfe0f) === 0x9002) {
    /* LDZ(DEC), 1001 000d dddd 0010 */
    const z = cpu.dataView.getUint16(30, true) - 1;
    cpu.dataView.setUint16(30, z, true);
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(z);
  } else if ((opcode & 0xd208) === 0x8000 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
    /* LDDZ, 10q0 qq0d dddd 0qqq */
    cpu.cycles++;
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.readData(cpu.dataView.getUint16(30, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8));
  } else if (opcode === 0x95c8) {
    /* LPM, 1001 0101 1100 1000 */
    cpu.data[0] = cpu.progBytes[cpu.dataView.getUint16(30, true)];
    cpu.cycles += 2;
  } else if ((opcode & 0xfe0f) === 0x9004) {
    /* LPM(REG), 1001 000d dddd 0100 */
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.progBytes[cpu.dataView.getUint16(30, true)];
    cpu.cycles += 2;
  } else if ((opcode & 0xfe0f) === 0x9005) {
    /* LPM(INC), 1001 000d dddd 0101 */
    const i = cpu.dataView.getUint16(30, true);
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.progBytes[i];
    cpu.dataView.setUint16(30, i + 1, true);
    cpu.cycles += 2;
  } else if ((opcode & 0xfe0f) === 0x9406) {
    /* LSR, 1001 010d dddd 0110 */
    const value = cpu.data[(opcode & 0x1f0) >> 4];
    const R = value >>> 1;
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xe0;
    sreg |= R ? 0 : 2;
    sreg |= value & 1;
    sreg |= sreg >> 2 & 1 ^ sreg & 1 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfc00) === 0x2c00) {
    /* MOV, 0010 11rd dddd rrrr */
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
  } else if ((opcode & 0xff00) === 0x100) {
    /* MOVW, 0000 0001 dddd rrrr */
    const r2 = 2 * (opcode & 0xf);
    const d2 = 2 * ((opcode & 0xf0) >> 4);
    cpu.data[d2] = cpu.data[r2];
    cpu.data[d2 + 1] = cpu.data[r2 + 1];
  } else if ((opcode & 0xfc00) === 0x9c00) {
    /* MUL, 1001 11rd dddd rrrr */
    const R = cpu.data[(opcode & 0x1f0) >> 4] * cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    cpu.dataView.setUint16(0, R, true);
    cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & R ? 0 : 2) | (0x8000 & R ? 1 : 0);
    cpu.cycles++;
  } else if ((opcode & 0xff00) === 0x200) {
    /* MULS, 0000 0010 dddd rrrr */
    const R = cpu.dataView.getInt8(((opcode & 0xf0) >> 4) + 16) * cpu.dataView.getInt8((opcode & 0xf) + 16);
    cpu.dataView.setInt16(0, R, true);
    cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & R ? 0 : 2) | (0x8000 & R ? 1 : 0);
    cpu.cycles++;
  } else if ((opcode & 0xff88) === 0x300) {
    /* MULSU, 0000 0011 0ddd 0rrr */
    const R = cpu.dataView.getInt8(((opcode & 0x70) >> 4) + 16) * cpu.data[(opcode & 7) + 16];
    cpu.dataView.setInt16(0, R, true);
    cpu.data[95] = cpu.data[95] & 0xfc | (0xffff & R ? 0 : 2) | (0x8000 & R ? 1 : 0);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x9401) {
    /* NEG, 1001 010d dddd 0001 */
    const d = (opcode & 0x1f0) >> 4;
    const value = cpu.data[d];
    const R = 0 - value;
    cpu.data[d] = R;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= 128 === R ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= R ? 1 : 0;
    sreg |= 1 & (R | value) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if (opcode === 0) {
    /* NOP, 0000 0000 0000 0000 */

    /* NOP */
  } else if ((opcode & 0xfc00) === 0x2800) {
    /* OR, 0010 10rd dddd rrrr */
    const R = cpu.data[(opcode & 0x1f0) >> 4] | cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xf000) === 0x6000) {
    /* SBR, 0110 KKKK dddd KKKK */
    const R = cpu.data[((opcode & 0xf0) >> 4) + 16] | (opcode & 0xf | (opcode & 0xf00) >> 4);
    cpu.data[((opcode & 0xf0) >> 4) + 16] = R;
    let sreg = cpu.data[95] & 0xe1;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xf800) === 0xb800) {
    /* OUT, 1011 1AAr rrrr AAAA */
    cpu.writeData((opcode & 0xf | (opcode & 0x600) >> 5) + 32, cpu.data[(opcode & 0x1f0) >> 4]);
  } else if ((opcode & 0xfe0f) === 0x900f) {
    /* POP, 1001 000d dddd 1111 */
    const value = cpu.dataView.getUint16(93, true) + 1;
    cpu.dataView.setUint16(93, value, true);
    cpu.data[(opcode & 0x1f0) >> 4] = cpu.data[value];
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x920f) {
    /* PUSH, 1001 001d dddd 1111 */
    const value = cpu.dataView.getUint16(93, true);
    cpu.data[value] = cpu.data[(opcode & 0x1f0) >> 4];
    cpu.dataView.setUint16(93, value - 1, true);
    cpu.cycles++;
  } else if ((opcode & 0xf000) === 0xd000) {
    /* RCALL, 1101 kkkk kkkk kkkk */
    const k = (opcode & 0x7ff) - (opcode & 0x800 ? 0x800 : 0);
    const retAddr = cpu.pc + 1;
    const sp = cpu.dataView.getUint16(93, true);
    const {
      pc22Bits
    } = cpu;
    cpu.data[sp] = 255 & retAddr;
    cpu.data[sp - 1] = retAddr >> 8 & 255;

    if (pc22Bits) {
      cpu.data[sp - 2] = retAddr >> 16 & 255;
    }

    cpu.dataView.setUint16(93, sp - (pc22Bits ? 3 : 2), true);
    cpu.pc += k;
    cpu.cycles += pc22Bits ? 3 : 2;
  } else if (opcode === 0x9508) {
    /* RET, 1001 0101 0000 1000 */
    const {
      pc22Bits
    } = cpu;
    const i = cpu.dataView.getUint16(93, true) + (pc22Bits ? 3 : 2);
    cpu.dataView.setUint16(93, i, true);
    cpu.pc = (cpu.data[i - 1] << 8) + cpu.data[i] - 1;

    if (pc22Bits) {
      cpu.pc |= cpu.data[i - 2] << 16;
    }

    cpu.cycles += pc22Bits ? 4 : 3;
  } else if (opcode === 0x9518) {
    /* RETI, 1001 0101 0001 1000 */
    const {
      pc22Bits
    } = cpu;
    const i = cpu.dataView.getUint16(93, true) + (pc22Bits ? 3 : 2);
    cpu.dataView.setUint16(93, i, true);
    cpu.pc = (cpu.data[i - 1] << 8) + cpu.data[i] - 1;

    if (pc22Bits) {
      cpu.pc |= cpu.data[i - 2] << 16;
    }

    cpu.cycles += pc22Bits ? 4 : 3;
    cpu.data[95] |= 0x80; // Enable interrupts
  } else if ((opcode & 0xf000) === 0xc000) {
    /* RJMP, 1100 kkkk kkkk kkkk */
    cpu.pc = cpu.pc + ((opcode & 0x7ff) - (opcode & 0x800 ? 0x800 : 0));
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x9407) {
    /* ROR, 1001 010d dddd 0111 */
    const d = cpu.data[(opcode & 0x1f0) >> 4];
    const r = d >>> 1 | (cpu.data[95] & 1) << 7;
    cpu.data[(opcode & 0x1f0) >> 4] = r;
    let sreg = cpu.data[95] & 0xe0;
    sreg |= r ? 0 : 2;
    sreg |= 128 & r ? 4 : 0;
    sreg |= 1 & d ? 1 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg & 1 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfc00) === 0x800) {
    /* SBC, 0000 10rd dddd rrrr */
    const val1 = cpu.data[(opcode & 0x1f0) >> 4];
    const val2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    let sreg = cpu.data[95];
    const R = val1 - val2 - (sreg & 1);
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    sreg = sreg & 0xc0 | (!R && sreg >> 1 & 1 ? 2 : 0) | (val2 + (sreg & 1) > val1 ? 1 : 0);
    sreg |= 128 & R ? 4 : 0;
    sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xf000) === 0x4000) {
    /* SBCI, 0100 KKKK dddd KKKK */
    const val1 = cpu.data[((opcode & 0xf0) >> 4) + 16];
    const val2 = opcode & 0xf | (opcode & 0xf00) >> 4;
    let sreg = cpu.data[95];
    const R = val1 - val2 - (sreg & 1);
    cpu.data[((opcode & 0xf0) >> 4) + 16] = R;
    sreg = sreg & 0xc0 | (!R && sreg >> 1 & 1 ? 2 : 0) | (val2 + (sreg & 1) > val1 ? 1 : 0);
    sreg |= 128 & R ? 4 : 0;
    sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xff00) === 0x9a00) {
    /* SBI, 1001 1010 AAAA Abbb */
    const target = ((opcode & 0xf8) >> 3) + 32;
    cpu.writeData(target, cpu.readData(target) | 1 << (opcode & 7));
    cpu.cycles++;
  } else if ((opcode & 0xff00) === 0x9900) {
    /* SBIC, 1001 1001 AAAA Abbb */
    const value = cpu.readData(((opcode & 0xf8) >> 3) + 32);

    if (!(value & 1 << (opcode & 7))) {
      const nextOpcode = cpu.progMem[cpu.pc + 1];
      const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
      cpu.cycles += skipSize;
      cpu.pc += skipSize;
    }
  } else if ((opcode & 0xff00) === 0x9b00) {
    /* SBIS, 1001 1011 AAAA Abbb */
    const value = cpu.readData(((opcode & 0xf8) >> 3) + 32);

    if (value & 1 << (opcode & 7)) {
      const nextOpcode = cpu.progMem[cpu.pc + 1];
      const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
      cpu.cycles += skipSize;
      cpu.pc += skipSize;
    }
  } else if ((opcode & 0xff00) === 0x9700) {
    /* SBIW, 1001 0111 KKdd KKKK */
    const i = 2 * ((opcode & 0x30) >> 4) + 24;
    const a = cpu.dataView.getUint16(i, true);
    const l = opcode & 0xf | (opcode & 0xc0) >> 2;
    const R = a - l;
    cpu.dataView.setUint16(i, R, true);
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 0x8000 & R ? 4 : 0;
    sreg |= a & ~R & 0x8000 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= l > a ? 1 : 0;
    sreg |= 1 & (~a & l | l & R | R & ~a) ? 0x20 : 0;
    cpu.data[95] = sreg;
    cpu.cycles++;
  } else if ((opcode & 0xfe08) === 0xfc00) {
    /* SBRC, 1111 110r rrrr 0bbb */
    if (!(cpu.data[(opcode & 0x1f0) >> 4] & 1 << (opcode & 7))) {
      const nextOpcode = cpu.progMem[cpu.pc + 1];
      const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
      cpu.cycles += skipSize;
      cpu.pc += skipSize;
    }
  } else if ((opcode & 0xfe08) === 0xfe00) {
    /* SBRS, 1111 111r rrrr 0bbb */
    if (cpu.data[(opcode & 0x1f0) >> 4] & 1 << (opcode & 7)) {
      const nextOpcode = cpu.progMem[cpu.pc + 1];
      const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
      cpu.cycles += skipSize;
      cpu.pc += skipSize;
    }
  } else if (opcode === 0x9588) {
    /* SLEEP, 1001 0101 1000 1000 */

    /* not implemented */
  } else if (opcode === 0x95e8) {
    /* SPM, 1001 0101 1110 1000 */

    /* not implemented */
  } else if (opcode === 0x95f8) {
    /* SPM(INC), 1001 0101 1111 1000 */

    /* not implemented */
  } else if ((opcode & 0xfe0f) === 0x9200) {
    /* STS, 1001 001d dddd 0000 kkkk kkkk kkkk kkkk */
    const value = cpu.data[(opcode & 0x1f0) >> 4];
    const addr = cpu.progMem[cpu.pc + 1];
    cpu.writeData(addr, value);
    cpu.pc++;
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x920c) {
    /* STX, 1001 001r rrrr 1100 */
    cpu.writeData(cpu.dataView.getUint16(26, true), cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x920d) {
    /* STX(INC), 1001 001r rrrr 1101 */
    const x = cpu.dataView.getUint16(26, true);
    cpu.writeData(x, cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.dataView.setUint16(26, x + 1, true);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x920e) {
    /* STX(DEC), 1001 001r rrrr 1110 */
    const i = cpu.data[(opcode & 0x1f0) >> 4];
    const x = cpu.dataView.getUint16(26, true) - 1;
    cpu.dataView.setUint16(26, x, true);
    cpu.writeData(x, i);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x8208) {
    /* STY, 1000 001r rrrr 1000 */
    cpu.writeData(cpu.dataView.getUint16(28, true), cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x9209) {
    /* STY(INC), 1001 001r rrrr 1001 */
    const i = cpu.data[(opcode & 0x1f0) >> 4];
    const y = cpu.dataView.getUint16(28, true);
    cpu.writeData(y, i);
    cpu.dataView.setUint16(28, y + 1, true);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x920a) {
    /* STY(DEC), 1001 001r rrrr 1010 */
    const i = cpu.data[(opcode & 0x1f0) >> 4];
    const y = cpu.dataView.getUint16(28, true) - 1;
    cpu.dataView.setUint16(28, y, true);
    cpu.writeData(y, i);
    cpu.cycles++;
  } else if ((opcode & 0xd208) === 0x8208 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
    /* STDY, 10q0 qq1r rrrr 1qqq */
    cpu.writeData(cpu.dataView.getUint16(28, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8), cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x8200) {
    /* STZ, 1000 001r rrrr 0000 */
    cpu.writeData(cpu.dataView.getUint16(30, true), cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x9201) {
    /* STZ(INC), 1001 001r rrrr 0001 */
    const z = cpu.dataView.getUint16(30, true);
    cpu.writeData(z, cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.dataView.setUint16(30, z + 1, true);
    cpu.cycles++;
  } else if ((opcode & 0xfe0f) === 0x9202) {
    /* STZ(DEC), 1001 001r rrrr 0010 */
    const i = cpu.data[(opcode & 0x1f0) >> 4];
    const z = cpu.dataView.getUint16(30, true) - 1;
    cpu.dataView.setUint16(30, z, true);
    cpu.writeData(z, i);
    cpu.cycles++;
  } else if ((opcode & 0xd208) === 0x8200 && opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8) {
    /* STDZ, 10q0 qq1r rrrr 0qqq */
    cpu.writeData(cpu.dataView.getUint16(30, true) + (opcode & 7 | (opcode & 0xc00) >> 7 | (opcode & 0x2000) >> 8), cpu.data[(opcode & 0x1f0) >> 4]);
    cpu.cycles++;
  } else if ((opcode & 0xfc00) === 0x1800) {
    /* SUB, 0001 10rd dddd rrrr */
    const val1 = cpu.data[(opcode & 0x1f0) >> 4];
    const val2 = cpu.data[opcode & 0xf | (opcode & 0x200) >> 5];
    const R = val1 - val2;
    cpu.data[(opcode & 0x1f0) >> 4] = R;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= val2 > val1 ? 1 : 0;
    sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xf000) === 0x5000) {
    /* SUBI, 0101 KKKK dddd KKKK */
    const val1 = cpu.data[((opcode & 0xf0) >> 4) + 16];
    const val2 = opcode & 0xf | (opcode & 0xf00) >> 4;
    const R = val1 - val2;
    cpu.data[((opcode & 0xf0) >> 4) + 16] = R;
    let sreg = cpu.data[95] & 0xc0;
    sreg |= R ? 0 : 2;
    sreg |= 128 & R ? 4 : 0;
    sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
    sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 0x10 : 0;
    sreg |= val2 > val1 ? 1 : 0;
    sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 0x20 : 0;
    cpu.data[95] = sreg;
  } else if ((opcode & 0xfe0f) === 0x9402) {
    /* SWAP, 1001 010d dddd 0010 */
    const d = (opcode & 0x1f0) >> 4;
    const i = cpu.data[d];
    cpu.data[d] = (15 & i) << 4 | (240 & i) >>> 4;
  } else if (opcode === 0x95a8) {
    /* WDR, 1001 0101 1010 1000 */

    /* not implemented */
  } else if ((opcode & 0xfe0f) === 0x9204) {
    /* XCH, 1001 001r rrrr 0100 */
    const r = (opcode & 0x1f0) >> 4;
    const val1 = cpu.data[r];
    const val2 = cpu.data[cpu.dataView.getUint16(30, true)];
    cpu.data[cpu.dataView.getUint16(30, true)] = val1;
    cpu.data[r] = val2;
  }

  cpu.pc = (cpu.pc + 1) % cpu.progMem.length;
  cpu.cycles++;
}
},{}],"../../node_modules/avr8js/dist/esm/peripherals/gpio.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVRIOPort = exports.PinOverrideMode = exports.PinState = exports.portLConfig = exports.portKConfig = exports.portJConfig = exports.portHConfig = exports.portGConfig = exports.portFConfig = exports.portEConfig = exports.portDConfig = exports.portCConfig = exports.portBConfig = exports.portAConfig = void 0;
const portAConfig = {
  PIN: 0x20,
  DDR: 0x21,
  PORT: 0x22
};
exports.portAConfig = portAConfig;
const portBConfig = {
  PIN: 0x23,
  DDR: 0x24,
  PORT: 0x25
};
exports.portBConfig = portBConfig;
const portCConfig = {
  PIN: 0x26,
  DDR: 0x27,
  PORT: 0x28
};
exports.portCConfig = portCConfig;
const portDConfig = {
  PIN: 0x29,
  DDR: 0x2a,
  PORT: 0x2b
};
exports.portDConfig = portDConfig;
const portEConfig = {
  PIN: 0x2c,
  DDR: 0x2d,
  PORT: 0x2e
};
exports.portEConfig = portEConfig;
const portFConfig = {
  PIN: 0x2f,
  DDR: 0x30,
  PORT: 0x31
};
exports.portFConfig = portFConfig;
const portGConfig = {
  PIN: 0x32,
  DDR: 0x33,
  PORT: 0x34
};
exports.portGConfig = portGConfig;
const portHConfig = {
  PIN: 0x100,
  DDR: 0x101,
  PORT: 0x102
};
exports.portHConfig = portHConfig;
const portJConfig = {
  PIN: 0x103,
  DDR: 0x104,
  PORT: 0x105
};
exports.portJConfig = portJConfig;
const portKConfig = {
  PIN: 0x106,
  DDR: 0x107,
  PORT: 0x108
};
exports.portKConfig = portKConfig;
const portLConfig = {
  PIN: 0x109,
  DDR: 0x10a,
  PORT: 0x10b
};
exports.portLConfig = portLConfig;
var PinState;
exports.PinState = PinState;

(function (PinState) {
  PinState[PinState["Low"] = 0] = "Low";
  PinState[PinState["High"] = 1] = "High";
  PinState[PinState["Input"] = 2] = "Input";
  PinState[PinState["InputPullUp"] = 3] = "InputPullUp";
})(PinState || (exports.PinState = PinState = {}));
/* This mechanism allows timers to override specific GPIO pins */


var PinOverrideMode;
exports.PinOverrideMode = PinOverrideMode;

(function (PinOverrideMode) {
  PinOverrideMode[PinOverrideMode["None"] = 0] = "None";
  PinOverrideMode[PinOverrideMode["Enable"] = 1] = "Enable";
  PinOverrideMode[PinOverrideMode["Set"] = 2] = "Set";
  PinOverrideMode[PinOverrideMode["Clear"] = 3] = "Clear";
  PinOverrideMode[PinOverrideMode["Toggle"] = 4] = "Toggle";
})(PinOverrideMode || (exports.PinOverrideMode = PinOverrideMode = {}));

class AVRIOPort {
  constructor(cpu, portConfig) {
    this.cpu = cpu;
    this.portConfig = portConfig;
    this.listeners = [];
    this.pinValue = 0;
    this.overrideMask = 0xff;
    this.lastValue = 0;
    this.lastDdr = 0;

    cpu.writeHooks[portConfig.DDR] = value => {
      const portValue = cpu.data[portConfig.PORT];
      cpu.data[portConfig.DDR] = value;
      this.updatePinRegister(portValue, value);
      this.writeGpio(portValue, value);
      return true;
    };

    cpu.writeHooks[portConfig.PORT] = value => {
      const ddrMask = cpu.data[portConfig.DDR];
      cpu.data[portConfig.PORT] = value;
      this.updatePinRegister(value, ddrMask);
      this.writeGpio(value, ddrMask);
      return true;
    };

    cpu.writeHooks[portConfig.PIN] = value => {
      // Writing to 1 PIN toggles PORT bits
      const oldPortValue = cpu.data[portConfig.PORT];
      const ddrMask = cpu.data[portConfig.DDR];
      const portValue = oldPortValue ^ value;
      cpu.data[portConfig.PORT] = portValue;
      cpu.data[portConfig.PIN] = cpu.data[portConfig.PIN] & ~ddrMask | portValue & ddrMask;
      this.writeGpio(portValue, ddrMask);
      return true;
    }; // The following hook is used by the timer compare output to override GPIO pins:


    cpu.gpioTimerHooks[portConfig.PORT] = (pin, mode) => {
      const pinMask = 1 << pin;

      if (mode == PinOverrideMode.None) {
        this.overrideMask |= pinMask;
      } else {
        this.overrideMask &= ~pinMask;

        switch (mode) {
          case PinOverrideMode.Enable:
            this.overrideValue &= ~pinMask;
            this.overrideValue |= cpu.data[portConfig.PORT] & pinMask;
            break;

          case PinOverrideMode.Set:
            this.overrideValue |= pinMask;
            break;

          case PinOverrideMode.Clear:
            this.overrideValue &= ~pinMask;
            break;

          case PinOverrideMode.Toggle:
            this.overrideValue ^= pinMask;
            break;
        }
      }

      this.writeGpio(cpu.data[portConfig.PORT], cpu.data[portConfig.DDR]);
    };
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  /**
   * Get the state of a given GPIO pin
   *
   * @param index Pin index to return from 0 to 7
   * @returns PinState.Low or PinState.High if the pin is set to output, PinState.Input if the pin is set
   *   to input, and PinState.InputPullUp if the pin is set to input and the internal pull-up resistor has
   *   been enabled.
   */


  pinState(index) {
    const ddr = this.cpu.data[this.portConfig.DDR];
    const port = this.cpu.data[this.portConfig.PORT];
    const bitMask = 1 << index;

    if (ddr & bitMask) {
      return this.lastValue & bitMask ? PinState.High : PinState.Low;
    } else {
      return port & bitMask ? PinState.InputPullUp : PinState.Input;
    }
  }
  /**
   * Sets the input value for the given pin. This is the value that
   * will be returned when reading from the PIN register.
   */


  setPin(index, value) {
    const bitMask = 1 << index;
    this.pinValue &= ~bitMask;

    if (value) {
      this.pinValue |= bitMask;
    }

    this.updatePinRegister(this.cpu.data[this.portConfig.PORT], this.cpu.data[this.portConfig.DDR]);
  }

  updatePinRegister(port, ddr) {
    this.cpu.data[this.portConfig.PIN] = this.pinValue & ~ddr | port & ddr;
  }

  writeGpio(value, ddr) {
    const newValue = (value & this.overrideMask | this.overrideValue) & ddr | value & ~ddr;
    const prevValue = this.lastValue;

    if (newValue !== prevValue || ddr !== this.lastDdr) {
      this.lastValue = newValue;
      this.lastDdr = ddr;

      for (const listener of this.listeners) {
        listener(newValue, prevValue);
      }
    }
  }

}

exports.AVRIOPort = AVRIOPort;
},{}],"../../node_modules/avr8js/dist/esm/peripherals/timer.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVRTimer = exports.timer2Config = exports.timer1Config = exports.timer0Config = void 0;

var _gpio = require("./gpio");

/**
 * AVR-8 Timers
 * Part of AVR8js
 * Reference: http://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf
 *
 * Copyright (C) 2019, 2020, Uri Shaked
 */
const timer01Dividers = {
  0: 0,
  1: 1,
  2: 8,
  3: 64,
  4: 256,
  5: 1024,
  6: 0,
  7: 0
};
/** These are differnet for some devices (e.g. ATtiny85) */

const defaultTimerBits = {
  // TIFR bits
  TOV: 1,
  OCFA: 2,
  OCFB: 4,
  // TIMSK bits
  TOIE: 1,
  OCIEA: 2,
  OCIEB: 4
};
const timer0Config = Object.assign({
  bits: 8,
  captureInterrupt: 0,
  compAInterrupt: 0x1c,
  compBInterrupt: 0x1e,
  ovfInterrupt: 0x20,
  TIFR: 0x35,
  OCRA: 0x47,
  OCRB: 0x48,
  ICR: 0,
  TCNT: 0x46,
  TCCRA: 0x44,
  TCCRB: 0x45,
  TCCRC: 0,
  TIMSK: 0x6e,
  dividers: timer01Dividers,
  compPortA: _gpio.portDConfig.PORT,
  compPinA: 6,
  compPortB: _gpio.portDConfig.PORT,
  compPinB: 5
}, defaultTimerBits);
exports.timer0Config = timer0Config;
const timer1Config = Object.assign({
  bits: 16,
  captureInterrupt: 0x14,
  compAInterrupt: 0x16,
  compBInterrupt: 0x18,
  ovfInterrupt: 0x1a,
  TIFR: 0x36,
  OCRA: 0x88,
  OCRB: 0x8a,
  ICR: 0x86,
  TCNT: 0x84,
  TCCRA: 0x80,
  TCCRB: 0x81,
  TCCRC: 0x82,
  TIMSK: 0x6f,
  dividers: timer01Dividers,
  compPortA: _gpio.portBConfig.PORT,
  compPinA: 1,
  compPortB: _gpio.portBConfig.PORT,
  compPinB: 2
}, defaultTimerBits);
exports.timer1Config = timer1Config;
const timer2Config = Object.assign({
  bits: 8,
  captureInterrupt: 0,
  compAInterrupt: 0x0e,
  compBInterrupt: 0x10,
  ovfInterrupt: 0x12,
  TIFR: 0x37,
  OCRA: 0xb3,
  OCRB: 0xb4,
  ICR: 0,
  TCNT: 0xb2,
  TCCRA: 0xb0,
  TCCRB: 0xb1,
  TCCRC: 0,
  TIMSK: 0x70,
  dividers: {
    0: 0,
    1: 1,
    2: 8,
    3: 32,
    4: 64,
    5: 128,
    6: 256,
    7: 1024
  },
  compPortA: _gpio.portBConfig.PORT,
  compPinA: 3,
  compPortB: _gpio.portDConfig.PORT,
  compPinB: 3
}, defaultTimerBits);
/* All the following types and constants are related to WGM (Waveform Generation Mode) bits: */

exports.timer2Config = timer2Config;
var TimerMode;

(function (TimerMode) {
  TimerMode[TimerMode["Normal"] = 0] = "Normal";
  TimerMode[TimerMode["PWMPhaseCorrect"] = 1] = "PWMPhaseCorrect";
  TimerMode[TimerMode["CTC"] = 2] = "CTC";
  TimerMode[TimerMode["FastPWM"] = 3] = "FastPWM";
  TimerMode[TimerMode["PWMPhaseFrequencyCorrect"] = 4] = "PWMPhaseFrequencyCorrect";
  TimerMode[TimerMode["Reserved"] = 5] = "Reserved";
})(TimerMode || (TimerMode = {}));

var TOVUpdateMode;

(function (TOVUpdateMode) {
  TOVUpdateMode[TOVUpdateMode["Max"] = 0] = "Max";
  TOVUpdateMode[TOVUpdateMode["Top"] = 1] = "Top";
  TOVUpdateMode[TOVUpdateMode["Bottom"] = 2] = "Bottom";
})(TOVUpdateMode || (TOVUpdateMode = {}));

var OCRUpdateMode;

(function (OCRUpdateMode) {
  OCRUpdateMode[OCRUpdateMode["Immediate"] = 0] = "Immediate";
  OCRUpdateMode[OCRUpdateMode["Top"] = 1] = "Top";
  OCRUpdateMode[OCRUpdateMode["Bottom"] = 2] = "Bottom";
})(OCRUpdateMode || (OCRUpdateMode = {}));

const TopOCRA = 1;
const TopICR = 2; // Enable Toggle mode for OCxA in PWM Wave Generation mode

const OCToggle = 1;
const {
  Normal,
  PWMPhaseCorrect,
  CTC,
  FastPWM,
  Reserved,
  PWMPhaseFrequencyCorrect
} = TimerMode;
const wgmModes8Bit = [
/*0*/
[Normal, 0xff, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*1*/
[PWMPhaseCorrect, 0xff, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
/*2*/
[CTC, TopOCRA, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*3*/
[FastPWM, 0xff, OCRUpdateMode.Bottom, TOVUpdateMode.Max, 0],
/*4*/
[Reserved, 0xff, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*5*/
[PWMPhaseCorrect, TopOCRA, OCRUpdateMode.Top, TOVUpdateMode.Bottom, OCToggle],
/*6*/
[Reserved, 0xff, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*7*/
[FastPWM, TopOCRA, OCRUpdateMode.Bottom, TOVUpdateMode.Top, OCToggle]]; // Table 16-4 in the datasheet

const wgmModes16Bit = [
/*0 */
[Normal, 0xffff, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*1 */
[PWMPhaseCorrect, 0x00ff, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
/*2 */
[PWMPhaseCorrect, 0x01ff, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
/*3 */
[PWMPhaseCorrect, 0x03ff, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
/*4 */
[CTC, TopOCRA, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*5 */
[FastPWM, 0x00ff, OCRUpdateMode.Bottom, TOVUpdateMode.Top, 0],
/*6 */
[FastPWM, 0x01ff, OCRUpdateMode.Bottom, TOVUpdateMode.Top, 0],
/*7 */
[FastPWM, 0x03ff, OCRUpdateMode.Bottom, TOVUpdateMode.Top, 0],
/*8 */
[PWMPhaseFrequencyCorrect, TopICR, OCRUpdateMode.Bottom, TOVUpdateMode.Bottom, 0],
/*9 */
[PWMPhaseFrequencyCorrect, TopOCRA, OCRUpdateMode.Bottom, TOVUpdateMode.Bottom, OCToggle],
/*10*/
[PWMPhaseCorrect, TopICR, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
/*11*/
[PWMPhaseCorrect, TopOCRA, OCRUpdateMode.Top, TOVUpdateMode.Bottom, OCToggle],
/*12*/
[CTC, TopICR, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*13*/
[Reserved, 0xffff, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
/*14*/
[FastPWM, TopICR, OCRUpdateMode.Bottom, TOVUpdateMode.Top, OCToggle],
/*15*/
[FastPWM, TopOCRA, OCRUpdateMode.Bottom, TOVUpdateMode.Top, OCToggle]];

function compToOverride(comp) {
  switch (comp) {
    case 1:
      return _gpio.PinOverrideMode.Toggle;

    case 2:
      return _gpio.PinOverrideMode.Clear;

    case 3:
      return _gpio.PinOverrideMode.Set;

    default:
      return _gpio.PinOverrideMode.Enable;
  }
}

class AVRTimer {
  constructor(cpu, config) {
    this.cpu = cpu;
    this.config = config;
    this.MAX = this.config.bits === 16 ? 0xffff : 0xff;
    this.lastCycle = 0;
    this.ocrA = 0;
    this.nextOcrA = 0;
    this.ocrB = 0;
    this.nextOcrB = 0;
    this.ocrUpdateMode = OCRUpdateMode.Immediate;
    this.tovUpdateMode = TOVUpdateMode.Max;
    this.icr = 0; // only for 16-bit timers

    this.tcnt = 0;
    this.tcntNext = 0;
    this.tcntUpdated = false;
    this.updateDivider = false;
    this.countingUp = true;
    this.divider = 0; // This is the temporary register used to access 16-bit registers (section 16.3 of the datasheet)

    this.highByteTemp = 0; // Interrupts

    this.OVF = {
      address: this.config.ovfInterrupt,
      flagRegister: this.config.TIFR,
      flagMask: this.config.TOV,
      enableRegister: this.config.TIMSK,
      enableMask: this.config.TOIE
    };
    this.OCFA = {
      address: this.config.compAInterrupt,
      flagRegister: this.config.TIFR,
      flagMask: this.config.OCFA,
      enableRegister: this.config.TIMSK,
      enableMask: this.config.OCIEA
    };
    this.OCFB = {
      address: this.config.compBInterrupt,
      flagRegister: this.config.TIFR,
      flagMask: this.config.OCFB,
      enableRegister: this.config.TIMSK,
      enableMask: this.config.OCIEB
    };

    this.count = (reschedule = true) => {
      const {
        divider,
        lastCycle,
        cpu
      } = this;
      const {
        cycles
      } = cpu;
      const delta = cycles - lastCycle;

      if (divider && delta >= divider) {
        const counterDelta = Math.floor(delta / divider);
        this.lastCycle += counterDelta * divider;
        const val = this.tcnt;
        const {
          timerMode,
          TOP
        } = this;
        const phasePwm = timerMode === PWMPhaseCorrect || timerMode === PWMPhaseFrequencyCorrect;
        const newVal = phasePwm ? this.phasePwmCount(val, counterDelta) : (val + counterDelta) % (TOP + 1);
        const overflow = val + counterDelta > TOP; // A CPU write overrides (has priority over) all counter clear or count operations.

        if (!this.tcntUpdated) {
          this.tcnt = newVal;

          if (!phasePwm) {
            this.timerUpdated(newVal, val);
          }
        }

        if (!phasePwm) {
          if (timerMode === FastPWM && overflow) {
            const {
              compA,
              compB
            } = this;

            if (compA) {
              this.updateCompPin(compA, 'A', true);
            }

            if (compB) {
              this.updateCompPin(compB, 'B', true);
            }
          }

          if (this.ocrUpdateMode == OCRUpdateMode.Bottom && overflow) {
            // OCRUpdateMode.Top only occurs in Phase Correct modes, handled by phasePwmCount()
            this.ocrA = this.nextOcrA;
            this.ocrB = this.nextOcrB;
          } // OCRUpdateMode.Bottom only occurs in Phase Correct modes, handled by phasePwmCount().
          // Thus we only handle TOVUpdateMode.Top or TOVUpdateMode.Max here.


          if (overflow && (this.tovUpdateMode == TOVUpdateMode.Top || TOP === this.MAX)) {
            cpu.setInterruptFlag(this.OVF);
          }
        }
      }

      if (this.tcntUpdated) {
        this.tcnt = this.tcntNext;
        this.tcntUpdated = false;
      }

      if (this.updateDivider) {
        const newDivider = this.config.dividers[this.CS];
        this.lastCycle = newDivider ? this.cpu.cycles : 0;
        this.updateDivider = false;
        this.divider = newDivider;

        if (newDivider) {
          cpu.addClockEvent(this.count, this.lastCycle + newDivider - cpu.cycles);
        }

        return;
      }

      if (reschedule && divider) {
        cpu.addClockEvent(this.count, this.lastCycle + divider - cpu.cycles);
      }
    };

    this.updateWGMConfig();

    this.cpu.readHooks[config.TCNT] = addr => {
      this.count(false);

      if (this.config.bits === 16) {
        this.cpu.data[addr + 1] = this.tcnt >> 8;
      }

      return this.cpu.data[addr] = this.tcnt & 0xff;
    };

    this.cpu.writeHooks[config.TCNT] = value => {
      this.tcntNext = this.highByteTemp << 8 | value;
      this.countingUp = true;
      this.tcntUpdated = true;
      this.cpu.updateClockEvent(this.count, 0);

      if (this.divider) {
        this.timerUpdated(this.tcntNext, this.tcntNext);
      }
    };

    this.cpu.writeHooks[config.OCRA] = value => {
      this.nextOcrA = this.highByteTemp << 8 | value;

      if (this.ocrUpdateMode === OCRUpdateMode.Immediate) {
        this.ocrA = this.nextOcrA;
      }
    };

    this.cpu.writeHooks[config.OCRB] = value => {
      this.nextOcrB = this.highByteTemp << 8 | value;

      if (this.ocrUpdateMode === OCRUpdateMode.Immediate) {
        this.ocrB = this.nextOcrB;
      }
    };

    this.cpu.writeHooks[config.ICR] = value => {
      this.icr = this.highByteTemp << 8 | value;
    };

    if (this.config.bits === 16) {
      const updateTempRegister = value => {
        this.highByteTemp = value;
      };

      this.cpu.writeHooks[config.TCNT + 1] = updateTempRegister;
      this.cpu.writeHooks[config.OCRA + 1] = updateTempRegister;
      this.cpu.writeHooks[config.OCRB + 1] = updateTempRegister;
      this.cpu.writeHooks[config.ICR + 1] = updateTempRegister;
    }

    cpu.writeHooks[config.TCCRA] = value => {
      this.cpu.data[config.TCCRA] = value;
      this.updateWGMConfig();
      return true;
    };

    cpu.writeHooks[config.TCCRB] = value => {
      this.cpu.data[config.TCCRB] = value;
      this.updateDivider = true;
      this.cpu.clearClockEvent(this.count);
      this.cpu.addClockEvent(this.count, 0);
      this.updateWGMConfig();
      return true;
    };

    cpu.writeHooks[config.TIFR] = value => {
      this.cpu.data[config.TIFR] = value;
      this.cpu.clearInterruptByFlag(this.OVF, value);
      this.cpu.clearInterruptByFlag(this.OCFA, value);
      this.cpu.clearInterruptByFlag(this.OCFB, value);
      return true;
    };

    cpu.writeHooks[config.TIMSK] = value => {
      this.cpu.updateInterruptEnable(this.OVF, value);
      this.cpu.updateInterruptEnable(this.OCFA, value);
      this.cpu.updateInterruptEnable(this.OCFB, value);
    };
  }

  reset() {
    this.divider = 0;
    this.lastCycle = 0;
    this.ocrA = 0;
    this.nextOcrA = 0;
    this.ocrB = 0;
    this.nextOcrB = 0;
    this.icr = 0;
    this.tcnt = 0;
    this.tcntNext = 0;
    this.tcntUpdated = false;
    this.countingUp = false;
    this.updateDivider = true;
  }

  get TCCRA() {
    return this.cpu.data[this.config.TCCRA];
  }

  get TCCRB() {
    return this.cpu.data[this.config.TCCRB];
  }

  get TIMSK() {
    return this.cpu.data[this.config.TIMSK];
  }

  get CS() {
    return this.TCCRB & 0x7;
  }

  get WGM() {
    const mask = this.config.bits === 16 ? 0x18 : 0x8;
    return (this.TCCRB & mask) >> 1 | this.TCCRA & 0x3;
  }

  get TOP() {
    switch (this.topValue) {
      case TopOCRA:
        return this.ocrA;

      case TopICR:
        return this.icr;

      default:
        return this.topValue;
    }
  }

  updateWGMConfig() {
    const {
      config,
      WGM
    } = this;
    const wgmModes = config.bits === 16 ? wgmModes16Bit : wgmModes8Bit;
    const TCCRA = this.cpu.data[config.TCCRA];
    const [timerMode, topValue, ocrUpdateMode, tovUpdateMode, flags] = wgmModes[WGM];
    this.timerMode = timerMode;
    this.topValue = topValue;
    this.ocrUpdateMode = ocrUpdateMode;
    this.tovUpdateMode = tovUpdateMode;
    const pwmMode = timerMode === FastPWM || timerMode === PWMPhaseCorrect || timerMode === PWMPhaseFrequencyCorrect;
    const prevCompA = this.compA;
    this.compA = TCCRA >> 6 & 0x3;

    if (this.compA === 1 && pwmMode && !(flags & OCToggle)) {
      this.compA = 0;
    }

    if (!!prevCompA !== !!this.compA) {
      this.updateCompA(this.compA ? _gpio.PinOverrideMode.Enable : _gpio.PinOverrideMode.None);
    }

    const prevCompB = this.compB;
    this.compB = TCCRA >> 4 & 0x3;

    if (this.compB === 1 && pwmMode) {
      this.compB = 0; // Reserved, according to the datasheet
    }

    if (!!prevCompB !== !!this.compB) {
      this.updateCompB(this.compB ? _gpio.PinOverrideMode.Enable : _gpio.PinOverrideMode.None);
    }
  }

  phasePwmCount(value, delta) {
    const {
      ocrA,
      ocrB,
      TOP,
      tcntUpdated
    } = this;

    while (delta > 0) {
      if (this.countingUp) {
        value++;

        if (value === TOP && !tcntUpdated) {
          this.countingUp = false;

          if (this.ocrUpdateMode === OCRUpdateMode.Top) {
            this.ocrA = this.nextOcrA;
            this.ocrB = this.nextOcrB;
          }
        }
      } else {
        value--;

        if (!value && !tcntUpdated) {
          this.countingUp = true;
          this.cpu.setInterruptFlag(this.OVF);

          if (this.ocrUpdateMode === OCRUpdateMode.Bottom) {
            this.ocrA = this.nextOcrA;
            this.ocrB = this.nextOcrB;
          }
        }
      }

      if (!tcntUpdated && value === ocrA) {
        this.cpu.setInterruptFlag(this.OCFA);

        if (this.compA) {
          this.updateCompPin(this.compA, 'A');
        }
      }

      if (!tcntUpdated && value === ocrB) {
        this.cpu.setInterruptFlag(this.OCFB);

        if (this.compB) {
          this.updateCompPin(this.compB, 'B');
        }
      }

      delta--;
    }

    return value;
  }

  timerUpdated(value, prevValue) {
    const {
      ocrA,
      ocrB
    } = this;
    const overflow = prevValue > value;

    if ((prevValue < ocrA || overflow) && value >= ocrA) {
      this.cpu.setInterruptFlag(this.OCFA);

      if (this.compA) {
        this.updateCompPin(this.compA, 'A');
      }
    }

    if ((prevValue < ocrB || overflow) && value >= ocrB) {
      this.cpu.setInterruptFlag(this.OCFB);

      if (this.compB) {
        this.updateCompPin(this.compB, 'B');
      }
    }
  }

  updateCompPin(compValue, pinName, bottom = false) {
    let newValue = _gpio.PinOverrideMode.None;
    const invertingMode = compValue === 3;
    const isSet = this.countingUp === invertingMode;

    switch (this.timerMode) {
      case Normal:
      case CTC:
        newValue = compToOverride(compValue);
        break;

      case FastPWM:
        if (compValue === 1) {
          newValue = bottom ? _gpio.PinOverrideMode.None : _gpio.PinOverrideMode.Toggle;
        } else {
          newValue = invertingMode !== bottom ? _gpio.PinOverrideMode.Set : _gpio.PinOverrideMode.Clear;
        }

        break;

      case PWMPhaseCorrect:
      case PWMPhaseFrequencyCorrect:
        if (compValue === 1) {
          newValue = _gpio.PinOverrideMode.Toggle;
        } else {
          newValue = isSet ? _gpio.PinOverrideMode.Set : _gpio.PinOverrideMode.Clear;
        }

        break;
    }

    if (newValue !== _gpio.PinOverrideMode.None) {
      if (pinName === 'A') {
        this.updateCompA(newValue);
      } else {
        this.updateCompB(newValue);
      }
    }
  }

  updateCompA(value) {
    const {
      compPortA,
      compPinA
    } = this.config;
    const hook = this.cpu.gpioTimerHooks[compPortA];

    if (hook) {
      hook(compPinA, value, compPortA);
    }
  }

  updateCompB(value) {
    const {
      compPortB,
      compPinB
    } = this.config;
    const hook = this.cpu.gpioTimerHooks[compPortB];

    if (hook) {
      hook(compPinB, value, compPortB);
    }
  }

}

exports.AVRTimer = AVRTimer;
},{"./gpio":"../../node_modules/avr8js/dist/esm/peripherals/gpio.js"}],"../../node_modules/avr8js/dist/esm/peripherals/usart.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVRUSART = exports.usart0Config = void 0;

/**
 * AVR-8 USART Peripheral
 * Part of AVR8js
 * Reference: http://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf
 *
 * Copyright (C) 2019, 2020, Uri Shaked
 */
const usart0Config = {
  rxCompleteInterrupt: 0x24,
  dataRegisterEmptyInterrupt: 0x26,
  txCompleteInterrupt: 0x28,
  UCSRA: 0xc0,
  UCSRB: 0xc1,
  UCSRC: 0xc2,
  UBRRL: 0xc4,
  UBRRH: 0xc5,
  UDR: 0xc6
};
/* eslint-disable @typescript-eslint/no-unused-vars */
// Register bits:

exports.usart0Config = usart0Config;
const UCSRA_RXC = 0x80; // USART Receive Complete

const UCSRA_TXC = 0x40; // USART Transmit Complete

const UCSRA_UDRE = 0x20; // USART Data Register Empty

const UCSRA_FE = 0x10; // Frame Error

const UCSRA_DOR = 0x8; // Data OverRun

const UCSRA_UPE = 0x4; // USART Parity Error

const UCSRA_U2X = 0x2; // Double the USART Transmission Speed

const UCSRA_MPCM = 0x1; // Multi-processor Communication Mode

const UCSRB_RXCIE = 0x80; // RX Complete Interrupt Enable

const UCSRB_TXCIE = 0x40; // TX Complete Interrupt Enable

const UCSRB_UDRIE = 0x20; // USART Data Register Empty Interrupt Enable

const UCSRB_RXEN = 0x10; // Receiver Enable

const UCSRB_TXEN = 0x8; // Transmitter Enable

const UCSRB_UCSZ2 = 0x4; // Character Size 2

const UCSRB_RXB8 = 0x2; // Receive Data Bit 8

const UCSRB_TXB8 = 0x1; // Transmit Data Bit 8

const UCSRC_UMSEL1 = 0x80; // USART Mode Select 1

const UCSRC_UMSEL0 = 0x40; // USART Mode Select 0

const UCSRC_UPM1 = 0x20; // Parity Mode 1

const UCSRC_UPM0 = 0x10; // Parity Mode 0

const UCSRC_USBS = 0x8; // Stop Bit Select

const UCSRC_UCSZ1 = 0x4; // Character Size 1

const UCSRC_UCSZ0 = 0x2; // Character Size 0

const UCSRC_UCPOL = 0x1; // Clock Polarity

/* eslint-enable @typescript-eslint/no-unused-vars */

const rxMasks = {
  5: 0x1f,
  6: 0x3f,
  7: 0x7f,
  8: 0xff,
  9: 0xff
};

class AVRUSART {
  constructor(cpu, config, freqHz) {
    this.cpu = cpu;
    this.config = config;
    this.freqHz = freqHz;
    this.onByteTransmit = null;
    this.onLineTransmit = null;
    this.onRxComplete = null;
    this.rxBusyValue = false;
    this.rxByte = 0;
    this.lineBuffer = ''; // Interrupts

    this.RXC = {
      address: this.config.rxCompleteInterrupt,
      flagRegister: this.config.UCSRA,
      flagMask: UCSRA_RXC,
      enableRegister: this.config.UCSRB,
      enableMask: UCSRB_RXCIE,
      constant: true
    };
    this.UDRE = {
      address: this.config.dataRegisterEmptyInterrupt,
      flagRegister: this.config.UCSRA,
      flagMask: UCSRA_UDRE,
      enableRegister: this.config.UCSRB,
      enableMask: UCSRB_UDRIE
    };
    this.TXC = {
      address: this.config.txCompleteInterrupt,
      flagRegister: this.config.UCSRA,
      flagMask: UCSRA_TXC,
      enableRegister: this.config.UCSRB,
      enableMask: UCSRB_TXCIE
    };
    this.reset();

    this.cpu.writeHooks[config.UCSRA] = value => {
      cpu.data[config.UCSRA] = value & (UCSRA_MPCM | UCSRA_U2X);
      cpu.clearInterruptByFlag(this.TXC, value);
      return true;
    };

    this.cpu.writeHooks[config.UCSRB] = (value, oldValue) => {
      cpu.updateInterruptEnable(this.RXC, value);
      cpu.updateInterruptEnable(this.UDRE, value);
      cpu.updateInterruptEnable(this.TXC, value);

      if (value & UCSRB_RXEN && oldValue & UCSRB_RXEN) {
        cpu.clearInterrupt(this.RXC);
      }

      if (value & UCSRB_TXEN && !(oldValue & UCSRB_TXEN)) {
        // Enabling the transmission - mark UDR as empty
        cpu.setInterruptFlag(this.UDRE);
      }
    };

    this.cpu.readHooks[config.UDR] = () => {
      var _a;

      const mask = (_a = rxMasks[this.bitsPerChar]) !== null && _a !== void 0 ? _a : 0xff;
      const result = this.rxByte & mask;
      this.rxByte = 0;
      this.cpu.clearInterrupt(this.RXC);
      return result;
    };

    this.cpu.writeHooks[config.UDR] = value => {
      if (this.onByteTransmit) {
        this.onByteTransmit(value);
      }

      if (this.onLineTransmit) {
        const ch = String.fromCharCode(value);

        if (ch === '\n') {
          this.onLineTransmit(this.lineBuffer);
          this.lineBuffer = '';
        } else {
          this.lineBuffer += ch;
        }
      }

      this.cpu.addClockEvent(() => {
        cpu.setInterruptFlag(this.UDRE);
        cpu.setInterruptFlag(this.TXC);
      }, this.cyclesPerChar);
      this.cpu.clearInterrupt(this.TXC);
      this.cpu.clearInterrupt(this.UDRE);
    };
  }

  reset() {
    this.cpu.data[this.config.UCSRA] = UCSRA_UDRE;
    this.cpu.data[this.config.UCSRB] = 0;
    this.cpu.data[this.config.UCSRC] = UCSRC_UCSZ1 | UCSRC_UCSZ0; // default: 8 bits per byte

    this.rxBusyValue = false;
    this.rxByte = 0;
    this.lineBuffer = '';
  }

  get rxBusy() {
    return this.rxBusyValue;
  }

  writeByte(value) {
    const {
      cpu,
      config
    } = this;

    if (this.rxBusyValue || !(cpu.data[config.UCSRB] & UCSRB_RXEN)) {
      return false;
    }

    this.rxBusyValue = true;
    cpu.addClockEvent(() => {
      var _a;

      this.rxByte = value;
      this.rxBusyValue = false;
      cpu.setInterruptFlag(this.RXC);
      (_a = this.onRxComplete) === null || _a === void 0 ? void 0 : _a.call(this);
    }, this.cyclesPerChar);
    return true;
  }

  get cyclesPerChar() {
    const symbolsPerChar = 1 + this.bitsPerChar + this.stopBits + (this.parityEnabled ? 1 : 0);
    return (this.UBRR * this.multiplier + 1) * symbolsPerChar;
  }

  get UBRR() {
    return this.cpu.data[this.config.UBRRH] << 8 | this.cpu.data[this.config.UBRRL];
  }

  get multiplier() {
    return this.cpu.data[this.config.UCSRA] & UCSRA_U2X ? 8 : 16;
  }

  get baudRate() {
    return Math.floor(this.freqHz / (this.multiplier * (1 + this.UBRR)));
  }

  get bitsPerChar() {
    const ucsz = (this.cpu.data[this.config.UCSRC] & (UCSRC_UCSZ1 | UCSRC_UCSZ0)) >> 1 | this.cpu.data[this.config.UCSRB] & UCSRB_UCSZ2;

    switch (ucsz) {
      case 0:
        return 5;

      case 1:
        return 6;

      case 2:
        return 7;

      case 3:
        return 8;

      default: // 4..6 are reserved

      case 7:
        return 9;
    }
  }

  get stopBits() {
    return this.cpu.data[this.config.UCSRC] & UCSRC_USBS ? 2 : 1;
  }

  get parityEnabled() {
    return this.cpu.data[this.config.UCSRC] & UCSRC_UPM1 ? true : false;
  }

  get parityOdd() {
    return this.cpu.data[this.config.UCSRC] & UCSRC_UPM0 ? true : false;
  }

}

exports.AVRUSART = AVRUSART;
},{}],"../../node_modules/avr8js/dist/esm/peripherals/eeprom.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVREEPROM = exports.eepromConfig = exports.EEPROMMemoryBackend = void 0;

class EEPROMMemoryBackend {
  constructor(size) {
    this.memory = new Uint8Array(size);
    this.memory.fill(0xff);
  }

  readMemory(addr) {
    return this.memory[addr];
  }

  writeMemory(addr, value) {
    this.memory[addr] &= value;
  }

  eraseMemory(addr) {
    this.memory[addr] = 0xff;
  }

}

exports.EEPROMMemoryBackend = EEPROMMemoryBackend;
const eepromConfig = {
  eepromReadyInterrupt: 0x2c,
  EECR: 0x3f,
  EEDR: 0x40,
  EEARL: 0x41,
  EEARH: 0x42,
  eraseCycles: 28800,
  writeCycles: 28800
};
exports.eepromConfig = eepromConfig;
const EERE = 1 << 0;
const EEPE = 1 << 1;
const EEMPE = 1 << 2;
const EERIE = 1 << 3;
const EEPM0 = 1 << 4;
const EEPM1 = 1 << 5;

class AVREEPROM {
  constructor(cpu, backend, config = eepromConfig) {
    this.cpu = cpu;
    this.backend = backend;
    this.config = config;
    /**
     * Used to keep track on the last write to EEMPE. From the datasheet:
     * The EEMPE bit determines whether setting EEPE to one causes the EEPROM to be written.
     * When EEMPE is set, setting EEPE within four clock cycles will write data to the EEPROM
     * at the selected address If EEMPE is zero, setting EEPE will have no effect.
     */

    this.writeEnabledCycles = 0;
    this.writeCompleteCycles = 0; // Interrupts

    this.EER = {
      address: this.config.eepromReadyInterrupt,
      flagRegister: this.config.EECR,
      flagMask: EEPE,
      enableRegister: this.config.EECR,
      enableMask: EERIE,
      constant: true,
      inverseFlag: true
    };

    this.cpu.writeHooks[this.config.EECR] = eecr => {
      const {
        EEARH,
        EEARL,
        EECR,
        EEDR
      } = this.config;
      const addr = this.cpu.data[EEARH] << 8 | this.cpu.data[EEARL];

      if (eecr & EERE) {
        this.cpu.clearInterrupt(this.EER);
      }

      if (eecr & EEMPE) {
        const eempeCycles = 4;
        this.writeEnabledCycles = this.cpu.cycles + eempeCycles;
        this.cpu.addClockEvent(() => {
          this.cpu.data[EECR] &= ~EEMPE;
        }, eempeCycles);
      } // Read


      if (eecr & EERE) {
        this.cpu.data[EEDR] = this.backend.readMemory(addr); // When the EEPROM is read, the CPU is halted for four cycles before the
        // next instruction is executed.

        this.cpu.cycles += 4;
        return true;
      } // Write


      if (eecr & EEPE) {
        //  If EEMPE is zero, setting EEPE will have no effect.
        if (this.cpu.cycles >= this.writeEnabledCycles) {
          return true;
        } // Check for write-in-progress


        if (this.cpu.cycles < this.writeCompleteCycles) {
          return true;
        }

        const eedr = this.cpu.data[EEDR];
        this.writeCompleteCycles = this.cpu.cycles; // Erase

        if (!(eecr & EEPM1)) {
          this.backend.eraseMemory(addr);
          this.writeCompleteCycles += this.config.eraseCycles;
        } // Write


        if (!(eecr & EEPM0)) {
          this.backend.writeMemory(addr, eedr);
          this.writeCompleteCycles += this.config.writeCycles;
        }

        this.cpu.data[EECR] |= EEPE;
        this.cpu.addClockEvent(() => {
          this.cpu.setInterruptFlag(this.EER);
        }, this.writeCompleteCycles - this.cpu.cycles); // When EEPE has been set, the CPU is halted for two cycles before the
        // next instruction is executed.

        this.cpu.cycles += 2;
        return true;
      }

      return false;
    };
  }

}

exports.AVREEPROM = AVREEPROM;
},{}],"../../node_modules/avr8js/dist/esm/peripherals/twi.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVRTWI = exports.NoopTWIEventHandler = exports.twiConfig = void 0;

/* eslint-disable @typescript-eslint/no-unused-vars */
// Register bits:
const TWCR_TWINT = 0x80; // TWI Interrupt Flag

const TWCR_TWEA = 0x40; // TWI Enable Acknowledge Bit

const TWCR_TWSTA = 0x20; // TWI START Condition Bit

const TWCR_TWSTO = 0x10; // TWI STOP Condition Bit

const TWCR_TWWC = 0x8; //TWI Write Collision Flag

const TWCR_TWEN = 0x4; //  TWI Enable Bit

const TWCR_TWIE = 0x1; // TWI Interrupt Enable

const TWSR_TWS_MASK = 0xf8; // TWI Status

const TWSR_TWPS1 = 0x2; // TWI Prescaler Bits

const TWSR_TWPS0 = 0x1; // TWI Prescaler Bits

const TWSR_TWPS_MASK = TWSR_TWPS1 | TWSR_TWPS0; // TWI Prescaler mask

const TWAR_TWA_MASK = 0xfe; //  TWI (Slave) Address Register

const TWAR_TWGCE = 0x1; // TWI General Call Recognition Enable Bit

const STATUS_BUS_ERROR = 0x0;
const STATUS_TWI_IDLE = 0xf8; // Master states

const STATUS_START = 0x08;
const STATUS_REPEATED_START = 0x10;
const STATUS_SLAW_ACK = 0x18;
const STATUS_SLAW_NACK = 0x20;
const STATUS_DATA_SENT_ACK = 0x28;
const STATUS_DATA_SENT_NACK = 0x30;
const STATUS_DATA_LOST_ARBITRATION = 0x38;
const STATUS_SLAR_ACK = 0x40;
const STATUS_SLAR_NACK = 0x48;
const STATUS_DATA_RECEIVED_ACK = 0x50;
const STATUS_DATA_RECEIVED_NACK = 0x58; // TODO: add slave states

/* eslint-enable @typescript-eslint/no-unused-vars */

const twiConfig = {
  twiInterrupt: 0x30,
  TWBR: 0xb8,
  TWSR: 0xb9,
  TWAR: 0xba,
  TWDR: 0xbb,
  TWCR: 0xbc,
  TWAMR: 0xbd
}; // A simple TWI Event Handler that sends a NACK for all events

exports.twiConfig = twiConfig;

class NoopTWIEventHandler {
  constructor(twi) {
    this.twi = twi;
  }

  start() {
    this.twi.completeStart();
  }

  stop() {
    this.twi.completeStop();
  }

  connectToSlave() {
    this.twi.completeConnect(false);
  }

  writeByte() {
    this.twi.completeWrite(false);
  }

  readByte() {
    this.twi.completeRead(0xff);
  }

}

exports.NoopTWIEventHandler = NoopTWIEventHandler;

class AVRTWI {
  constructor(cpu, config, freqHz) {
    this.cpu = cpu;
    this.config = config;
    this.freqHz = freqHz;
    this.eventHandler = new NoopTWIEventHandler(this); // Interrupts

    this.TWI = {
      address: this.config.twiInterrupt,
      flagRegister: this.config.TWCR,
      flagMask: TWCR_TWINT,
      enableRegister: this.config.TWCR,
      enableMask: TWCR_TWIE
    };
    this.updateStatus(STATUS_TWI_IDLE);

    this.cpu.writeHooks[config.TWCR] = value => {
      this.cpu.data[config.TWCR] = value;
      const clearInt = value & TWCR_TWINT;
      this.cpu.clearInterruptByFlag(this.TWI, value);
      this.cpu.updateInterruptEnable(this.TWI, value);
      const {
        status
      } = this;

      if (clearInt && value & TWCR_TWEN) {
        const twdrValue = this.cpu.data[this.config.TWDR];
        this.cpu.addClockEvent(() => {
          if (value & TWCR_TWSTA) {
            this.eventHandler.start(status !== STATUS_TWI_IDLE);
          } else if (value & TWCR_TWSTO) {
            this.eventHandler.stop();
          } else if (status === STATUS_START || status === STATUS_REPEATED_START) {
            this.eventHandler.connectToSlave(twdrValue >> 1, twdrValue & 0x1 ? false : true);
          } else if (status === STATUS_SLAW_ACK || status === STATUS_DATA_SENT_ACK) {
            this.eventHandler.writeByte(twdrValue);
          } else if (status === STATUS_SLAR_ACK || status === STATUS_DATA_RECEIVED_ACK) {
            const ack = !!(value & TWCR_TWEA);
            this.eventHandler.readByte(ack);
          }
        }, 0);
        return true;
      }
    };
  }

  get prescaler() {
    switch (this.cpu.data[this.config.TWSR] & TWSR_TWPS_MASK) {
      case 0:
        return 1;

      case 1:
        return 4;

      case 2:
        return 16;

      case 3:
        return 64;
    } // We should never get here:


    throw new Error('Invalid prescaler value!');
  }

  get sclFrequency() {
    return this.freqHz / (16 + 2 * this.cpu.data[this.config.TWBR] * this.prescaler);
  }

  completeStart() {
    this.updateStatus(this.status === STATUS_TWI_IDLE ? STATUS_START : STATUS_REPEATED_START);
  }

  completeStop() {
    this.cpu.data[this.config.TWCR] &= ~TWCR_TWSTO;
    this.updateStatus(STATUS_TWI_IDLE);
  }

  completeConnect(ack) {
    if (this.cpu.data[this.config.TWDR] & 0x1) {
      this.updateStatus(ack ? STATUS_SLAR_ACK : STATUS_SLAR_NACK);
    } else {
      this.updateStatus(ack ? STATUS_SLAW_ACK : STATUS_SLAW_NACK);
    }
  }

  completeWrite(ack) {
    this.updateStatus(ack ? STATUS_DATA_SENT_ACK : STATUS_DATA_SENT_NACK);
  }

  completeRead(value) {
    const ack = !!(this.cpu.data[this.config.TWCR] & TWCR_TWEA);
    this.cpu.data[this.config.TWDR] = value;
    this.updateStatus(ack ? STATUS_DATA_RECEIVED_ACK : STATUS_DATA_RECEIVED_NACK);
  }

  get status() {
    return this.cpu.data[this.config.TWSR] & TWSR_TWS_MASK;
  }

  updateStatus(value) {
    const {
      TWSR
    } = this.config;
    this.cpu.data[TWSR] = this.cpu.data[TWSR] & ~TWSR_TWS_MASK | value;
    this.cpu.setInterruptFlag(this.TWI);
  }

}

exports.AVRTWI = AVRTWI;
},{}],"../../node_modules/avr8js/dist/esm/peripherals/spi.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVRSPI = exports.spiConfig = void 0;
// Register bits:
const SPCR_SPIE = 0x80; //  SPI Interrupt Enable

const SPCR_SPE = 0x40; // SPI Enable

const SPCR_DORD = 0x20; // Data Order

const SPCR_MSTR = 0x10; //  Master/Slave Select

const SPCR_CPOL = 0x8; // Clock Polarity

const SPCR_CPHA = 0x4; // Clock Phase

const SPCR_SPR1 = 0x2; // SPI Clock Rate Select 1

const SPCR_SPR0 = 0x1; // SPI Clock Rate Select 0

const SPSR_SPR_MASK = SPCR_SPR1 | SPCR_SPR0;
const SPSR_SPIF = 0x80; // SPI Interrupt Flag

const SPSR_WCOL = 0x40; // Write COLlision Flag

const SPSR_SPI2X = 0x1; // Double SPI Speed Bit

const spiConfig = {
  spiInterrupt: 0x22,
  SPCR: 0x4c,
  SPSR: 0x4d,
  SPDR: 0x4e
};
exports.spiConfig = spiConfig;
const bitsPerByte = 8;

class AVRSPI {
  constructor(cpu, config, freqHz) {
    this.cpu = cpu;
    this.config = config;
    this.freqHz = freqHz;
    this.onTransfer = null;
    this.transmissionActive = false;
    this.receivedByte = 0; // Interrupts

    this.SPI = {
      address: this.config.spiInterrupt,
      flagRegister: this.config.SPSR,
      flagMask: SPSR_SPIF,
      enableRegister: this.config.SPCR,
      enableMask: SPCR_SPIE
    };
    const {
      SPCR,
      SPSR,
      SPDR
    } = config;

    cpu.writeHooks[SPDR] = value => {
      var _a, _b;

      if (!(cpu.data[SPCR] & SPCR_SPE)) {
        // SPI not enabled, ignore write
        return;
      } // Write collision


      if (this.transmissionActive) {
        cpu.data[SPSR] |= SPSR_WCOL;
        return true;
      } // Clear write collision / interrupt flags


      cpu.data[SPSR] &= ~SPSR_WCOL;
      this.cpu.clearInterrupt(this.SPI);
      this.receivedByte = (_b = (_a = this.onTransfer) === null || _a === void 0 ? void 0 : _a.call(this, value)) !== null && _b !== void 0 ? _b : 0;
      const cyclesToComplete = this.clockDivider * bitsPerByte;
      this.transmissionActive = true;
      this.cpu.addClockEvent(() => {
        this.cpu.data[SPDR] = this.receivedByte;
        this.cpu.setInterruptFlag(this.SPI);
        this.transmissionActive = false;
      }, cyclesToComplete);
      return true;
    };

    cpu.writeHooks[SPSR] = value => {
      this.cpu.data[SPSR] = value;
      this.cpu.clearInterruptByFlag(this.SPI, value);
    };
  }

  reset() {
    this.transmissionActive = false;
    this.receivedByte = 0;
  }

  get isMaster() {
    return this.cpu.data[this.config.SPCR] & SPCR_MSTR ? true : false;
  }

  get dataOrder() {
    return this.cpu.data[this.config.SPCR] & SPCR_DORD ? 'lsbFirst' : 'msbFirst';
  }

  get spiMode() {
    const CPHA = this.cpu.data[this.config.SPCR] & SPCR_CPHA;
    const CPOL = this.cpu.data[this.config.SPCR] & SPCR_CPOL;
    return (CPHA ? 2 : 0) | (CPOL ? 1 : 0);
  }
  /**
   * The clock divider is only relevant for Master mode
   */


  get clockDivider() {
    const base = this.cpu.data[this.config.SPSR] & SPSR_SPI2X ? 2 : 4;

    switch (this.cpu.data[this.config.SPCR] & SPSR_SPR_MASK) {
      case 0b00:
        return base;

      case 0b01:
        return base * 4;

      case 0b10:
        return base * 16;

      case 0b11:
        return base * 32;
    } // We should never get here:


    throw new Error('Invalid divider value!');
  }
  /**
   * The SPI freqeuncy is only relevant to Master mode.
   * In slave mode, the frequency can be as high as F(osc) / 4.
   */


  get spiFrequency() {
    return this.freqHz / this.clockDivider;
  }

}

exports.AVRSPI = AVRSPI;
},{}],"../../node_modules/avr8js/dist/esm/peripherals/clock.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AVRClock = exports.clockConfig = void 0;

/**
 * AVR8 Clock
 * Part of AVR8js
 * Reference: http://ww1.microchip.com/downloads/en/DeviceDoc/ATmega48A-PA-88A-PA-168A-PA-328-P-DS-DS40002061A.pdf
 *
 * Copyright (C) 2020, Uri Shaked
 */
const CLKPCE = 128;
const clockConfig = {
  CLKPR: 0x61
};
exports.clockConfig = clockConfig;
const prescalers = [1, 2, 4, 8, 16, 32, 64, 128, 256, // The following values are "reserved" according to the datasheet, so we measured
// with a scope to figure them out (on ATmega328p)
2, 4, 8, 16, 32, 64, 128];

class AVRClock {
  constructor(cpu, baseFreqHz, config = clockConfig) {
    this.cpu = cpu;
    this.baseFreqHz = baseFreqHz;
    this.config = config;
    this.clockEnabledCycles = 0;
    this.prescalerValue = 1;
    this.cyclesDelta = 0;

    this.cpu.writeHooks[this.config.CLKPR] = clkpr => {
      if ((!this.clockEnabledCycles || this.clockEnabledCycles < cpu.cycles) && clkpr === CLKPCE) {
        this.clockEnabledCycles = this.cpu.cycles + 4;
      } else if (this.clockEnabledCycles && this.clockEnabledCycles >= cpu.cycles) {
        this.clockEnabledCycles = 0;
        const index = clkpr & 0xf;
        const oldPrescaler = this.prescalerValue;
        this.prescalerValue = prescalers[index];
        this.cpu.data[this.config.CLKPR] = index;

        if (oldPrescaler !== this.prescalerValue) {
          this.cyclesDelta = (cpu.cycles + this.cyclesDelta) * (oldPrescaler / this.prescalerValue) - cpu.cycles;
        }
      }

      return true;
    };
  }

  get frequency() {
    return this.baseFreqHz / this.prescalerValue;
  }

  get prescaler() {
    return this.prescalerValue;
  }

  get timeNanos() {
    return (this.cpu.cycles + this.cyclesDelta) / this.frequency * 1e9;
  }

  get timeMicros() {
    return (this.cpu.cycles + this.cyclesDelta) / this.frequency * 1e6;
  }

  get timeMillis() {
    return (this.cpu.cycles + this.cyclesDelta) / this.frequency * 1e3;
  }

}

exports.AVRClock = AVRClock;
},{}],"../../node_modules/avr8js/dist/esm/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  CPU: true,
  avrInstruction: true,
  avrInterrupt: true,
  AVRTimer: true,
  timer0Config: true,
  timer1Config: true,
  timer2Config: true,
  AVRIOPort: true,
  portAConfig: true,
  portBConfig: true,
  portCConfig: true,
  portDConfig: true,
  portEConfig: true,
  portFConfig: true,
  portGConfig: true,
  portHConfig: true,
  portJConfig: true,
  portKConfig: true,
  portLConfig: true,
  PinState: true,
  AVRUSART: true,
  usart0Config: true,
  AVREEPROM: true,
  EEPROMMemoryBackend: true,
  eepromConfig: true,
  spiConfig: true,
  AVRSPI: true,
  AVRClock: true,
  clockConfig: true
};
Object.defineProperty(exports, "CPU", {
  enumerable: true,
  get: function () {
    return _cpu.CPU;
  }
});
Object.defineProperty(exports, "avrInstruction", {
  enumerable: true,
  get: function () {
    return _instruction.avrInstruction;
  }
});
Object.defineProperty(exports, "avrInterrupt", {
  enumerable: true,
  get: function () {
    return _interrupt.avrInterrupt;
  }
});
Object.defineProperty(exports, "AVRTimer", {
  enumerable: true,
  get: function () {
    return _timer.AVRTimer;
  }
});
Object.defineProperty(exports, "timer0Config", {
  enumerable: true,
  get: function () {
    return _timer.timer0Config;
  }
});
Object.defineProperty(exports, "timer1Config", {
  enumerable: true,
  get: function () {
    return _timer.timer1Config;
  }
});
Object.defineProperty(exports, "timer2Config", {
  enumerable: true,
  get: function () {
    return _timer.timer2Config;
  }
});
Object.defineProperty(exports, "AVRIOPort", {
  enumerable: true,
  get: function () {
    return _gpio.AVRIOPort;
  }
});
Object.defineProperty(exports, "portAConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portAConfig;
  }
});
Object.defineProperty(exports, "portBConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portBConfig;
  }
});
Object.defineProperty(exports, "portCConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portCConfig;
  }
});
Object.defineProperty(exports, "portDConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portDConfig;
  }
});
Object.defineProperty(exports, "portEConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portEConfig;
  }
});
Object.defineProperty(exports, "portFConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portFConfig;
  }
});
Object.defineProperty(exports, "portGConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portGConfig;
  }
});
Object.defineProperty(exports, "portHConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portHConfig;
  }
});
Object.defineProperty(exports, "portJConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portJConfig;
  }
});
Object.defineProperty(exports, "portKConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portKConfig;
  }
});
Object.defineProperty(exports, "portLConfig", {
  enumerable: true,
  get: function () {
    return _gpio.portLConfig;
  }
});
Object.defineProperty(exports, "PinState", {
  enumerable: true,
  get: function () {
    return _gpio.PinState;
  }
});
Object.defineProperty(exports, "AVRUSART", {
  enumerable: true,
  get: function () {
    return _usart.AVRUSART;
  }
});
Object.defineProperty(exports, "usart0Config", {
  enumerable: true,
  get: function () {
    return _usart.usart0Config;
  }
});
Object.defineProperty(exports, "AVREEPROM", {
  enumerable: true,
  get: function () {
    return _eeprom.AVREEPROM;
  }
});
Object.defineProperty(exports, "EEPROMMemoryBackend", {
  enumerable: true,
  get: function () {
    return _eeprom.EEPROMMemoryBackend;
  }
});
Object.defineProperty(exports, "eepromConfig", {
  enumerable: true,
  get: function () {
    return _eeprom.eepromConfig;
  }
});
Object.defineProperty(exports, "spiConfig", {
  enumerable: true,
  get: function () {
    return _spi.spiConfig;
  }
});
Object.defineProperty(exports, "AVRSPI", {
  enumerable: true,
  get: function () {
    return _spi.AVRSPI;
  }
});
Object.defineProperty(exports, "AVRClock", {
  enumerable: true,
  get: function () {
    return _clock.AVRClock;
  }
});
Object.defineProperty(exports, "clockConfig", {
  enumerable: true,
  get: function () {
    return _clock.clockConfig;
  }
});

var _cpu = require("./cpu/cpu");

var _instruction = require("./cpu/instruction");

var _interrupt = require("./cpu/interrupt");

var _timer = require("./peripherals/timer");

var _gpio = require("./peripherals/gpio");

var _usart = require("./peripherals/usart");

var _eeprom = require("./peripherals/eeprom");

var _twi = require("./peripherals/twi");

Object.keys(_twi).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _twi[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _twi[key];
    }
  });
});

var _spi = require("./peripherals/spi");

var _clock = require("./peripherals/clock");
},{"./cpu/cpu":"../../node_modules/avr8js/dist/esm/cpu/cpu.js","./cpu/instruction":"../../node_modules/avr8js/dist/esm/cpu/instruction.js","./cpu/interrupt":"../../node_modules/avr8js/dist/esm/cpu/interrupt.js","./peripherals/timer":"../../node_modules/avr8js/dist/esm/peripherals/timer.js","./peripherals/gpio":"../../node_modules/avr8js/dist/esm/peripherals/gpio.js","./peripherals/usart":"../../node_modules/avr8js/dist/esm/peripherals/usart.js","./peripherals/eeprom":"../../node_modules/avr8js/dist/esm/peripherals/eeprom.js","./peripherals/twi":"../../node_modules/avr8js/dist/esm/peripherals/twi.js","./peripherals/spi":"../../node_modules/avr8js/dist/esm/peripherals/spi.js","./peripherals/clock":"../../node_modules/avr8js/dist/esm/peripherals/clock.js"}],"intelhex.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadHex = loadHex;

/**
 * Minimal Intel HEX loader
 * Part of AVR8js
 *
 * Copyright (C) 2019, Uri Shaked
 */
function loadHex(source, target) {
  for (const line of source.split('\n')) {
    if (line[0] === ':' && line.substr(7, 2) === '00') {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);

      for (let i = 0; i < bytes; i++) {
        target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
      }
    }
  }
}
},{}],"emulator.js":[function(require,module,exports) {
"use strict";

var avr8js = _interopRequireWildcard(require("avr8js"));

var _intelhex = require("./intelhex");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class Emulator {
  constructor(leds, button) {
    this.frameId;
    this.cpu;
    this.timer0;
    this.portA;
    this.portB;
    this.portC;
    this.portD;
    this.cache;
    this.program = new Uint16Array();
    this.clockFrequency = 16000000;
    this.flashSize = 32768;
    this.leds = leds;
    this.button = button;
  }

  loadGame(hex) {
    const temp = new Uint8Array(this.flashSize / 2);
    (0, _intelhex.loadHex)(hex, temp);
    this.program = new Uint16Array(temp.buffer);
    this.cpu = new avr8js.CPU(this.program);
    this.timer0 = new avr8js.AVRTimer(this.cpu, avr8js.timer0Config);
    this.usart = new avr8js.AVRUSART(this.cpu, avr8js.usart0Config, this.clockFrequency);
    this.initPorts();
    this.initSerialCommunication();
    this.enableAnalogRead();
  }

  initPorts() {
    this.portA = new avr8js.AVRIOPort(this.cpu, avr8js.portAConfig);
    this.portB = new avr8js.AVRIOPort(this.cpu, avr8js.portBConfig);
    this.portC = new avr8js.AVRIOPort(this.cpu, avr8js.portCConfig);
    this.portD = new avr8js.AVRIOPort(this.cpu, avr8js.portDConfig);
    this.button.state = avr8js.PinState.Low;
    this.button.domElement.addEventListener('mousedown', () => this.buttonPressHandler());
    this.button.domElement.addEventListener('mouseup', () => this.buttonReleaseHandler());
    this.button.domElement.addEventListener('mouseleave', () => this.buttonReleaseHandler());
    this.portA.addListener(() => {
      this.ledHandler('portA');
    });
    this.portB.addListener(() => {
      this.ledHandler('portB');
    });
    this.portC.addListener(() => {
      this.ledHandler('portC');
    });
    this.portD.addListener(() => {
      this.ledHandler('portD');
    });
  }

  initSerialCommunication() {
    this.cache = '';

    this.usart.onByteTransmit = rawvalue => {
      const value = String.fromCharCode(rawvalue);

      if (value == '\n') {
        console.log(this.cache);
        this.cache = '';
        return;
      }

      this.cache += value;
    };
  }

  enableAnalogRead() {
    //NOTE: AVR8JS is still working on a proper way to populate the registers used by analogRead
    //https://github.com/wokwi/avr8js/issues/13
    //The current code is the lowlevel solution the avr8js team came up with, it takes care of all invocations of analogRead()
    //https://stackblitz.com/edit/avr8js-simon-game?file=execute.ts
    // Simulate analog port (so that analogRead() eventually return)
    this.cpu.writeHooks[0x7a] = value => {
      if (value & 1 << 6) {
        this.cpu.data[0x7a] = value & ~(1 << 6); // clear bit - conversion done
        // random value

        const analogValue = Math.floor(Math.random() * 1024);
        this.cpu.data[0x78] = analogValue & 0xff;
        this.cpu.data[0x79] = analogValue >> 8 & 0x3;
        return true; // don't update
      }
    };
  }

  buttonPressHandler() {
    this[this.button.avrPort].setPin(this.button.avrPin, avr8js.PinState.High);
    this.button.state = avr8js.PinState.High;
  }

  buttonReleaseHandler() {
    if (this[this.button.avrPort].pinState(this.button.avrPin) != avr8js.PinState.Low) {
      this[this.button.avrPort].setPin(this.button.avrPin, avr8js.PinState.Low);
      this.button.state = avr8js.PinState.Low;
    }
  }

  ledHandler(port) {
    const connectedLeds = this.leds.filter(led => {
      return led.avrPort == port;
    });

    for (let led of connectedLeds) {
      if (this[port].pinState(led.avrPin) === avr8js.PinState.High) {
        led.domElement.classList.remove('off');
        led.domElement.classList.add('on');
        led.state = true;
        continue;
      }

      led.domElement.classList.remove('on');
      led.domElement.classList.add('off');
      led.state = false;
    }
  }

  executeGame() {
    const deadline = this.cpu.cycles + this.clockFrequency / 60;

    while (this.cpu.cycles <= deadline) {
      avr8js.avrInstruction(this.cpu);
      this.cpu.tick();
    }

    this.frameId = requestAnimationFrame(() => this.executeGame());
  }

  stopGame() {
    cancelAnimationFrame(this.frameId);

    for (let led of this.leds) {
      if (led.state) {
        led.domElement.classList.remove('on');
        led.domElement.classList.add('off');
        led.state = false;
      }
    }
  }

}

window.Emulator = Emulator;
},{"avr8js":"../../node_modules/avr8js/dist/esm/index.js","./intelhex":"intelhex.js"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "40121" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","emulator.js"], null)
//# sourceMappingURL=/emulator.js.map