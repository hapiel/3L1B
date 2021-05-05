#include <TLOB.h>

TLOB TLOB(2,3,4,5);

int led = 0;

void setup() {

}

void loop() {
  
  if (TLOB.buttonPressed){
    led = TLOB.prev(led);
  }

  if (TLOB.buttonDown){
    TLOB.leds[led] = true;
  } else {
    TLOB.allOff();
  }

  TLOB.update();
}
