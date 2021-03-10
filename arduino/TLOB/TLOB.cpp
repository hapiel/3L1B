#include "Arduino.h"
#include "TLOB.h"

TLOB::TLOB(int led1Pin, int led2Pin, int led3Pin, int buttonPin){
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(led3Pin, OUTPUT);
  _led1Pin = led1Pin;
  _led2Pin = led2Pin;
  _led3Pin = led3Pin;
  _buttonPin = buttonPin;
}

void TLOB::updateButton(){
  // update button on the beginning of each step. 
  // QUESTION: Could end work just as well, so that we only need a single update function?
  // TODO: add debouncing

  // false by default
  buttonReleased = true;
  buttonPressed = false;
  buttonHold = 0;

  // no button down registered yet
  if (!buttonDown) {

    // but physical button is down
    if (digitalRead(_buttonPin)) {
      buttonPressed = true;

      // record time
      holdTimer = millis();
    }

  } else {

    // button down was already registered, so were no longer in pressed event.
    buttonPressed = false;

    // if button is still down
    if (digitalRead(_buttonPin)) {
      // time since time recorded
      buttonHold = millis() - holdTimer;

    // button was released this step
    } else {
      buttonReleased = true;
    }
  }

  // set buttonDown to physical button state
  buttonDown = digitalRead (_buttonPin);
}

void TLOB::updateLeds(){
  // update leds at end of each step.
  // QUESTION: do we also want individual led variabes, led1, led2, led3?
  digitalWrite( _led1Pin, leds[0]);
  digitalWrite( _led2Pin, leds[1]);
  digitalWrite( _led3Pin, leds[2]);
}
