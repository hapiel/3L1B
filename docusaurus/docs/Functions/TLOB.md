#TLOB

`TLOB myTlobObject(int ledpin1, int ledpin2, int ledpin3, int buttonpin)`

Constructor for the library object. This creates the objects that allows you to use the library methods, and you set the pin numbers here.

Recommended usage:
`TLOB tlob(2,3,4,5);`

Code example:

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

All the other example code in this documentation assumes you have initialised TLOB with the name `tlob`.