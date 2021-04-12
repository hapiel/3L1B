#include <TLOB.h>
#include "lightspeed.h"
#include "roulette.h"

Roulette game01;
Lightspeed game02;

int game;

void setup() {
  if (digitalRead(8)){
    game01.setup();
    game = 1;
  } else {
    game02.setup();
    game = 2;
  }
}

void loop() {
  if (game == 1){
    game01.loop();
  }
  if (game == 2){
    game02.loop();
  }
}
