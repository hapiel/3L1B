#include <TLOB.h>

TLOB TLOB(2,3,4,5);

void setup() {

}

void loop() {
  
  if (TLOB.buttonDown){
    TLOB.allOn();
  } else {
    TLOB.allOff();
  }

  TLOB.update();
}
