#include <TLOB.h>

TLOB TLOB(2,3,4,5);
String gameState = "play";

unsigned long time = 0;

void setup() {
  randomSeed(analogRead(0));
  Serial.begin(19200);
}

void loop() {
  
  // When the game is won, lights are 
  if (gameState == "win"){
    if (TLOB.buttonPressed){
      gameState = "play";
      TLOB.allStop();
      TLOB.allOff();
    }
  }

  //whilst in play mode
  if (gameState == "play"){

    // when the button is pressed
    if (TLOB.buttonPressed){
      // if all leds are on
      if (TLOB.led(0) && TLOB.led(1) && TLOB.led(2)){
        // blink all leds
        TLOB.blinkAll();
        gameState = "win";
      } else {
        //loose
        TLOB.allOff();
        delay(500);
      }
    } else {
      // if 100ms have passed
      if (millis() - time > 100){
        // only if random lands on 0, 1 or 2 a led is changed.
        int rand = random(5);
        TLOB.led(rand, !TLOB.led(rand));
        time = millis();
      }
    }
  }

  TLOB.update();
}
