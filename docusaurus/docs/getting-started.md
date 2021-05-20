---
sidebar_position: 2
slug: /
---

# Getting started

Make sure to install the TLOB library by copying the [library files](https://github.com/hapiel/TLOB) to your Arduino library folder/TLOB

Connect 3 leds 1 button to your arduino, using a pull-down resistor on the button so that the pin reads high when the button is pressed.

Then copy the template below and replace the pin numbers: `tlob(led1, led2, led3, button)` 


```cpp
// include the TLOB library
#include <TLOB.h>

// initialise the TLOB object with the name tlob
TLOB tlob(2,3,4,5);

void setup() {

}

void loop() {
  
  // if the button is down
  if (tlob.buttonDown()){
    // turn all leds on
    tlob.ledAll(HIGH);
  } else {
    // turn all leds off
    tlob.ledAll(LOW);
  }

  // update the tlob object so that it knows if the button is up or down
  tlob.update();
}
```

Now upload the code to your arduino, and hold press the button to check if all leds light up.

## update()

It is recommended to call `tlob.update();` once per loop, this will make sure that button variables are processed as expected and that blink functions will work correctly. Alternatively you can call `tlob.updateLeds()` and 'tlob.updateButton()` separately.

## Functions

The TLOB library comes with a few functions and variables to make programming 3L1B games easier. It is recommendable to have a look at [led()](<Functions/led>),  [blink()](<Functions/blink>) and [buttonPressed()](<Functions/buttonPressed>)  to begin with, but the other functions will surely be useful to you too.

