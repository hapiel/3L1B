#include <TLOB.h>

TLOB TLOB(2,3,4,5);

String gameState = "finished";

unsigned long holdTimer;
unsigned long ledTimer;
int blinkOnDuration;
int blinkOffDuration;
int selected;
int ballPos;
float ballSpd;
int ballStopSpd = 1200;


void setup() {
  Serial.begin(9600);

  randomSeed(analogRead(0));

}

void loop() {

  if (gameState == "finished"){
    // button is held 800ms
    if (TLOB.buttonHold > 800){
      gameState = "selection";
      selected = 0;
      ledTimer = millis();
      TLOB.leds[0] = 1;
      TLOB.leds[1] = 0;
      TLOB.leds[2] = 0;
      blinkOnDuration = 400;
      blinkOffDuration = 100;
    }
  }

  if (gameState == "selection"){

    //select next
    if (TLOB.buttonPressed){
      selected = TLOB.next(selected);
      TLOB.allOff();
      TLOB.leds[selected] = 1;
      blinkOnDuration = 400;
      blinkOffDuration = 100;
    }

    // blink increasing speed
    if (TLOB.leds[selected]){
      if (ledTimer < millis() - blinkOnDuration){
        TLOB.leds[selected] = 0;
        ledTimer = millis();
        blinkOnDuration *= 0.85;
      }
    }
    if (!TLOB.leds[selected]){
      if (ledTimer < millis() - blinkOffDuration){
        TLOB.leds[selected] = 1;
        ledTimer = millis();
        blinkOffDuration *= 0.95;
      }
    }
    if (blinkOnDuration < 40){
      gameState = "selected";
      ledTimer = millis();
      TLOB.leds[selected] = 1;
    }

  }

  if (gameState == "selected"){
    if (ledTimer < millis() - 1000) {
      gameState = "rolling";
      ballPos = random(3);
      ballSpd = random(20);
      ledTimer = millis();
    }
  }

  if (gameState == "rolling"){
    TLOB.allOff();
    if (ledTimer < millis() - ballSpd){
      // ball too slow, end game
      if (ballSpd > ballStopSpd){
        gameState = "result";
        ledTimer = millis();
      } else {
        // increase speed and go to next
        ledTimer = millis();
        ballPos = TLOB.next(ballPos);
        ballSpd *= 1.1;
      }
    }
    TLOB.leds[ballPos] = 1;
      
  }

  if (gameState == "result"){
    if (selected == ballPos){
      //WIN! :D
      TLOB.blink(ballPos, 20);
      
    } else {
      //LOOSE :(
      TLOB.blink(ballPos, 20);
      TLOB.blink(selected, 200);
    }
    gameState = "resultDone";
  }
  if (gameState == "resultDone"){
    if (ledTimer < millis() - 3000){
        gameState = "finished";
        TLOB.allStop();
        TLOB.allOff();
      }
  }

  TLOB.update();
}


