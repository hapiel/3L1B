#include <TLOB.h>

TLOB tlob(2,3,4,5);

void setup() {

}

void loop() {
  
  if (tlob.buttonDown()){
    tlob.ledAll(true);
  } else {
    tlob.ledAll(false);
  }

  tlob.update();
}
