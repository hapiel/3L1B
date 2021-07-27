#include <TLOB.h>

// whackamole. Hit when a specific blinking pattern is on screen.
// flash lights when hit correctly


TLOB tlob(2,3,4,5);

// decreases as game progresses
int onTime = 2000;
// Current offtimes (normally randomly generated between max & min)
int offTimes[3] = {0, 300, 500};
int offTimeMax = 3000;
int offTimeMin = 500;

bool active[3] = {false, false, false};
int moleActive = -1;

// blink speeds. First is the mole (120).
int blinkTimes[7] = {120, 800, 800, 30, 30, 400, 30};
int arraySize = 1;

int level = 0;

// starting time for first round
unsigned long ledTimers[3] = {0, 0, 0};

String gameState = "playing";

void setup() {
  randomSeed(analogRead(A0));

}

void loop() {

  if (gameState == "playing"){
    
    for (int i = 0; i < 3; i++){
      // if not active & past time
      if (!active[i] && ledTimers[i] + offTimes[i] < millis()){
        active[i] = true;
        int randBlink = random(arraySize);
        // if random == mole
        if (randBlink == 0){
          // if no mole active
          if (moleActive == -1){
            tlob.blink(i, blinkTimes[0]);
            moleActive = i;
          } 
        } else {
          // if rolled is not mole
          tlob.blink(i, blinkTimes[randBlink]);
        }
        ledTimers[i] = millis();
      }

      // if active
      if (active[i] && ledTimers[i] + onTime < millis()){
        active[i] = false;
        tlob.stop(i);
        tlob.led(i, false);
        offTimes[i] = offTimeMin + random(offTimeMax);
        // if this was the mole
        if (moleActive == i){
          lose();
        }
      }
    }

    if (tlob.buttonPressed()){
      if (moleActive == -1){
        lose();
      } else {
        win();
      }
    }

  }

  
  if (gameState == "lose"){
    if (ledTimers[0] + 2000 < millis()){
      gameState = "playing";
      resetLeds();
    }
  }

  
  if (gameState == "win"){

    tlob.ledAll(false);
    tlob.led(((millis()-ledTimers[0]) / 60) % 4, true);
    if (ledTimers[0] + 800 < millis()){
      gameState = "playing";
      resetLeds();              
    }
  }

  if (tlob.buttonHold() > 1500){
    resetLeds();
    updateLevel(-9999);
    gameState = "playing";
  }
  tlob.update();
}


void lose(){
  tlob.stopAll();
  ledTimers[0] = millis();
  tlob.blinkAll(400,50);
  updateLevel(-2);
  gameState = "lose";
}

void win(){
  tlob.stopAll();
  ledTimers[0] = millis();
  updateLevel(1);
  gameState = "win";
}

void resetLeds(){
  moleActive = -1;
  tlob.stopAll();
  tlob.ledAll(false);
  for (int i = 0; i < 3; i++){
    ledTimers[i] = millis();
    offTimes[i] = offTimeMin + random(offTimeMax);
  }    
}

void updateLevel(int jumpTo){
  level = max(0, level + jumpTo);
  if (level < 2){
    onTime = 2000;
    offTimeMax = 3000;
    offTimeMin = 1000;
    arraySize = 1;
  } else if (level < 5){
    onTime = 1500;
    offTimeMax = 3500;
    offTimeMin = 1000;
    arraySize = 3;    
  } else if (level < 8){
    onTime = 1100;
    offTimeMax = 3000;
    offTimeMin = 800;
    arraySize = 3;    
  } else if (level < 11){
    onTime = 1000;
    offTimeMax = 3000;
    offTimeMin = 600;
    arraySize = 4;    
  } else if (level < 15){
    onTime = 900;
    offTimeMax = 2800;
    offTimeMin = 600;
    arraySize = 5;    
  } else if (level < 20){
    onTime = 800;
    offTimeMax = 2500;
    offTimeMin = 500;
    arraySize = 6;    
  } else {
    onTime *= 0.97;
    offTimeMax *= 0.95;
    offTimeMin *= 0.95;
    arraySize = 7;    
  }
}