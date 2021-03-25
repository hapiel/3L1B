#include <TLOB.h>

TLOB TLOB(2,3,4,5);

void setup() {
  TLOB.blink(0, 500);
  TLOB.blink(1, 100, 400);
  TLOB.blink(2, 400, 100);
  Serial.begin(9600);
}

void loop() {
  if (TLOB.buttonPressed){
    TLOB.blinkOff[0] -= 30;
    TLOB.blinkOff[1] -= 30;
    TLOB.blinkOff[2] -= 30;
    // why do leds 1 & 2 go off after a few presses???
    Serial.print(TLOB.blinkOn[2]);
    Serial.print(" ");
    Serial.println(TLOB.blinkOff[2]);
  }

 

  TLOB.update();
}
