import * as avr8js from 'avr8js';
import { loadHex } from './intelhex';

class Emulator {
    constructor(ledSelector) {
        this.frameId;
        this.cpu;
        this.timer0;
        this.portB;

        this.program = new Uint16Array();
        this.clockFrequency = 16000000;
        this.flashSize = 32768;

        this.leds = [
            {
                pin: 13,
                avrPin: 5,
                domElement: document.querySelector(ledSelector),
                state: false,
            }
        ]
    }

    loadGame(hex) {
        const temp = new Uint8Array(this.flashSize / 2);
        loadHex(hex, temp);
        this.program = new Uint16Array(temp.buffer);
        this.cpu = new avr8js.CPU(this.program);

        this.timer0 = new avr8js.AVRTimer(this.cpu, avr8js.timer0Config);
        this.portB = new avr8js.AVRIOPort(this.cpu, avr8js.portBConfig);

        this.portB.addListener(() => {
            for(let led of this.leds) {
                led.state = this.portB.pinState(led.avrPin) === avr8js.PinState.High;

                if(led.state) {
                    led.domElement.classList.remove('off');
                    led.domElement.classList.add('on');
                    continue;
                }

                led.domElement.classList.remove('on');
                led.domElement.classList.add('off');
            }
        })
    }

    executeGame() {
        const deadline = this.cpu.cycles + (this.clockFrequency / 60); 
        while(this.cpu.cycles <= deadline) {
            avr8js.avrInstruction(this.cpu);
            this.cpu.tick();
        }

        this.frameId = requestAnimationFrame(() => this.executeGame());
    }
}

window.Emulator = Emulator;
