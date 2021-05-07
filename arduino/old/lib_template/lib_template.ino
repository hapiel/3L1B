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
