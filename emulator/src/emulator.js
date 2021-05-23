import * as avr8js from 'avr8js';
import { loadHex } from './intelhex';

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
        loadHex(hex, temp);
        this.program = new Uint16Array(temp.buffer);
        this.cpu = new avr8js.CPU(this.program);

        this.timer0 = new avr8js.AVRTimer(this.cpu, avr8js.timer0Config);
        this.usart = new avr8js.AVRUSART(this.cpu, avr8js.usart0Config, this.clockFrequency);

        this.initPorts();
        this.initSerialCommunication();
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
        this.usart.onByteTransmit = (rawvalue) => {
            const value = String.fromCharCode(rawvalue);
            if(value == '\n') {
                console.log(this.cache);
                this.cache = '';
                return;
            }

            this.cache += value;
        };
    }

    buttonPressHandler() {
        this[this.button.avrPort].setPin(this.button.avrPin, avr8js.PinState.High);
        this.button.state = avr8js.PinState.High;
    }

    buttonReleaseHandler() {
        if(this[this.button.avrPort].pinState(this.button.avrPin) != avr8js.PinState.Low) {
            this[this.button.avrPort].setPin(this.button.avrPin, avr8js.PinState.Low);
            this.button.state = avr8js.PinState.Low;
        }
    }

    ledHandler(port) {
        const connectedLeds = this.leds.filter((led) => {
            return led.avrPort == port;
        });

        for(let led of connectedLeds) {
            if(this[port].pinState(led.avrPin) === avr8js.PinState.High) {
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
        const deadline = this.cpu.cycles + (this.clockFrequency / 60); 
        while(this.cpu.cycles <= deadline) {
            avr8js.avrInstruction(this.cpu);
            this.cpu.tick();
        }

        this.frameId = requestAnimationFrame(() => this.executeGame());
    }

    stopGame() {
        cancelAnimationFrame(this.frameId);
        for(let led of this.leds) {
            if(led.state) {
                led.domElement.classList.remove('on');
                led.domElement.classList.add('off');
                led.state = false;
            }
        }
    }
}

window.Emulator = Emulator;
