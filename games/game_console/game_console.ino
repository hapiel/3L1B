#include <TLOB.h>
#include "lightspeed.h"
#include "roulette.h"
#include "all_on_simple.h"
#include "binary_sum.h"
#include "race.h"


Lightspeed game01;
Roulette game02;
AllOn game03;
BinarySum game04;
Race game05;


int game;

void setup() {
  pinMode(A5, INPUT);
  pinMode(A6, INPUT);
  pinMode(A7, INPUT);

  
  // I forgot to ground the switch, so this is a fix.
  bool s1 = analogRead(A5) > 1015;
  bool s2 = analogRead(A6) > 1015;
  bool s3 = analogRead(A7) > 1015;


  // 0 0 0
  if (!s1 && !s2 && !s3){
    game01.setup();
    game = 1;
  }
  
  // 1 0 0
  if (s1 && !s2 && !s3){
    game02.setup();
    game = 2;
  }

  // 0 1 0
  if (!s1 && s2 && !s3){
    game03.setup();
    game = 3;
  }

  // 1 1 0
  if (s1 && s2 && !s3){
    game04.setup();
    game = 4;
  }
  // 0 0 1
  if (!s1 && !s2 && s3){
    game05.setup();
    game = 5;
  }

  // // 1 0 1
  // if (s1 && !s2 && s3){
  //   game06.setup();
  //   game = 6;
  // }

  // // 1 1 0
  // if (s1 && s2 && !s3){
  //   game07.setup();
  //   game = 7;
  // }

  // // 1 1 1
  // if (s1 && s2 && s3){
  //   game08.setup();
  //   game = 8;
  // }

}

void loop() {
  if (game == 1){
    game01.loop();
  }
  if (game == 2){
    game02.loop();
  }
  if (game == 3){
    game03.loop();
  }
  if (game == 4){
    game04.loop();
  }
  if (game == 5){
    game05.loop();
  }
  // if (game == 6){
  //   game06.loop();
  // }
  // if (game == 7){
  //   game07.loop();
  // }
  // if (game == 8){
  //   game08.loop();
  // }
}
