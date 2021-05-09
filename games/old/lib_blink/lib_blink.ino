#include <TLOB.h>

TLOB TLOB(2,3,4,5);

void setup() {
  TLOB.blink(4, 20);
  TLOB.blink(1, 100, 400);
  TLOB.blink(2, 400, 100);
 
}

void loop() {
  if (TLOB.buttonPressed()){
    TLOB.stop(0);
    TLOB.stop(2);
  }

  if (TLOB.buttonHold() > 300 && TLOB.buttonHold() < 999){
    TLOB.allStop();
    TLOB.ledAll(0);
  }

  if (TLOB.buttonHold() > 1200){
    TLOB.blink(0, 500);
    TLOB.blink(1, 100, 400);
    TLOB.blink(2, 400, 100);
  }

  TLOB.update();
}
