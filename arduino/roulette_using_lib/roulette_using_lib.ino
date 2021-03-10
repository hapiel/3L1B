#include <TLOB.h>

TLOB TLOB(4,3,2,5);

String gameState = "finished";

unsigned long holdTimer;
unsigned long ledTimer;
unsigned long ledTimer2;
unsigned long ledTimer3;
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
  TLOB.updateButton();

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
      selected = (selected + 1) % 3;
      TLOB.leds[0] = 0;
      TLOB.leds[1] = 0;
      TLOB.leds[2] = 0;
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
    TLOB.leds[0] = 0;
    TLOB.leds[1] = 0;
    TLOB.leds[2] = 0;
    if (ledTimer < millis() - ballSpd){
      // ball too slow, end game
      if (ballSpd > ballStopSpd){
        gameState = "result";
        ledTimer = millis();
        ledTimer2 = millis();
        ledTimer3 = millis();
      } else {
        // increase speed and go to next
        ledTimer = millis();
        ballPos = (ballPos + 1) % 3;
        ballSpd *= 1.1;
      }
    }
    TLOB.leds[ballPos] = 1;
      
  }

  if (gameState == "result"){
    if (selected == ballPos){
      //WIN! :D
      if (ledTimer < millis() - 20){
        TLOB.leds[ballPos] = !TLOB.leds[ballPos];
        ledTimer = millis();
      }
      
    } else {
      //LOOSE :(
      if (ledTimer < millis() - 20){
        TLOB.leds[ballPos] = !TLOB.leds[ballPos];
        ledTimer = millis();
      }
      if (ledTimer2 < millis() - 200){
        TLOB.leds[selected] = !TLOB.leds[selected];
        ledTimer2 = millis();
      }
    }
    if (ledTimer3 < millis() - 3000){
      gameState = "finished";
      TLOB.leds[0] = 0;
      TLOB.leds[1] = 0;
      TLOB.leds[2] = 0;
    }
  }

  TLOB.updateLeds();

}


