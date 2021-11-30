#TLOB

`TLOB myTlobObject(int ledpin1, int ledpin2, int ledpin3, int buttonpin, [int buttonMode])`

Constructor for the library object. This creates the objects that allows you to use the library methods, and you set the pin numbers here.

The buttonMode can optionally be set to 0 for internal pullup, 1 if you use an external pullup, or 2 if you use an external pulldown (so the pin reads `HIGH` if you push the button down).
By default this is set to 0, so no extra resistor is needed.

Recommended usage:
`TLOB tlob(2,3,4,5);`

Code example:

```cpp
// include the TLOB library
#include <TLOB.h>

// initialise the TLOB object with the name tlob
// leds on pin 2, 3, 4
// button on pin , using the internal pullup for the button (default)

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

All other example codes in this documentation assume you have initialised TLOB with the name `tlob`.