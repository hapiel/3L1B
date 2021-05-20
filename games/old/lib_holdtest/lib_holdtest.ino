#include <TLOB.h>

TLOB TLOB(2,3,4,5);

void setup() {

  Serial.begin(19200);
}

void loop() {
  TLOB.updateButton();

  if (TLOB.buttonDown() || TLOB.buttonReleased()){
    Serial.print(millis());
    Serial.print(" ");
    Serial.print(TLOB.buttonPressed());
    Serial.print(" ");
    Serial.print(TLOB.buttonDown());
    Serial.print(" ");
    Serial.print(TLOB.buttonReleased());
    Serial.print(" ");
    Serial.println(TLOB.buttonHold());
  }
  
  // Serial.print(TLOB.buttonDown());
  // Serial.print(" ");
  // Serial.print(TLOB.buttonPressed());
  // Serial.print(" ");
  // Serial.print(TLOB.buttonReleased());
  // Serial.print(" ");
  // Serial.println(TLOB.buttonHold());

 

  
}
