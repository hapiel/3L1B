#include <TLOB_02.h>

TLOB TLOB(2,3,4,5);

void setup() {

}

void loop() {
  
  TLOB.led(1, !TLOB.led(1));
  delay(100);

  TLOB.update();
}
