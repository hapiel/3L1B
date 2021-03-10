/*
  TLOB 3l1b 3 lights 1 button WIP library
*/

#ifndef TLOB_h
#define TLOB_h

#include "Arduino.h"

class TLOB {
  public:
    TLOB(int led1Pin, int led2Pin, int led3Pin, int buttonPin);
    bool buttonDown;
    bool buttonPressed;
    bool buttonReleased;
    unsigned long buttonHold;
    bool leds[3];
    void updateButton();
    void updateLeds();

  private:
  int _led1Pin;
  int _led2Pin;
  int _led3Pin;
  int _buttonPin;
  unsigned long holdTimer;
};

#endif