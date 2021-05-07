---
sidebar_position: 2
slug: /
---

# Getting started

Make sure to install the TLOB library by copying the [library files](https://github.com/hapiel/TLOB) to your Arduino library folder/TLOB

Connect 3 leds 1 button to your arduino, using a pull-down resistor on the button so that the pin reads high when the button is pressed.

Then copy the template below and replace the pin numbers: `tlob(led1, led2, led3, button)` 



```cpp
#include <TLOB.h>

TLOB tlob(2,3,4,5);

void setup() {

}

void loop() {
  
  if (tlob.buttonDown){
    tlob.allOn();
  } else {
    tlob.allOff();
  }

  tlob.update();
}
```

Now upload the code to your arduino, and hold press the button to check if all leds light up.

## update()

It is recommended to call `tlob.update();` once per loop, this will make sure that button variables are processed as expected and that blink functions will work correctly. Alternatively you can call `tlob.updateLeds()` and 'tlob.updateButton()` separately.

## Functions and variables

The TLOB library comes with a few functions and variables to make programming 3L1B games easier. It is recommendable to have a look at [led()](<Functions and variables/led>),  [blink()](<Functions and variables/blink>) and [buttonPressed](<Functions and variables/buttonPressed>)  to begin with, but the other variables and functions will surely be useful to you too.

