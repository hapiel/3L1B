#include <TLOB.h>

// whackamole. Hit when a specific blinking pattern is on screen.
// flash lights when hit correctly


TLOB tlob(3,2,4,5);



int onTime = 1000;
// how long should the led be off before new
int offTimes[] = {3000, 3000, 3000};
int offTimeMax = 3000;
int offTimeMin = 500;

bool active[] = {0, 0, 0};

// how long each blink type lasts. 120 is the mole.
int blinkTimes[] = {120, 30, 800, 30};
int arraySize = 4;



unsigned long ledTimers[] = {0, 0, 4000};


void setup() {
  randomSeed(analogRead(A0));
}

void loop() {

  // if not active & past time
  if (!active[0] && ledTimers[0] + offTimes[0] < millis()){
    active[0] = 1;
    tlob.blink(0, blinkTimes[random(3)]);
    ledTimers[0] = millis();
  }

  if (active[0] && ledTimers[0] + onTime < millis()){
    active[0] = 0;
    tlob.stop(0);
    tlob.led(0, 0);
    offTimes[0] = offTimeMin + random(offTimeMax);
  }



  

  tlob.update();
}
