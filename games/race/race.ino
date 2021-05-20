#include <TLOB.h>

// A racing game, press the button as fast as you can. 
// Once you've done 60 presses you will be shown the speed you scored.


TLOB tlob(3,2,4,5);


int presses = 0;
unsigned long timer = 0;
long score = 0;
unsigned long animTimer = 0;
String gameState = "countdown";

// clicks per round, 3 rounds.
int clicks = 20;


void setup() {
}

void loop() {

  if (gameState == "countdown"){
    tlob.ledAll(0);
    delay(700);
    tlob.led(2, 1);
    delay(700);
    tlob.led(1,1);
    delay(700);
    tlob.led(0,1);
    delay(700);
    tlob.ledAll(0);
    timer = millis();
    gameState = "race";
  }



  if (gameState == "race"){
    if (tlob.buttonPressed()){
      presses ++;
      // blink faster and faster, switching to the next led after 20 presses

      tlob.blink(2 - presses/clicks, (presses - ((presses / clicks) * clicks)) * 5, 500);
      // this line of code caused a hard to find bug, 2 - presses/clicks can be -1, and for some reason that caused problems in the library, I'm still not sure what.
      // fixed it in the library...

      // stop the first led
      if (presses > clicks){
        tlob.stop(2);
        tlob.led(2,1);
      }

      // stop the second led
      if (presses > clicks * 2){
        tlob.stop(1);
        tlob.led(1,1);
      }

      // game finished
      if (presses > clicks * 3){
        tlob.blinkAll(300, 400);
        score = millis() - timer;
        // set timer for animation
        animTimer = millis();
        // next state
        gameState = "gameEnd";        
      }
    }
  }
  
  if (gameState == "gameEnd"){
    if (animTimer < millis() - 2300){
      tlob.stopAll();
      scoreDisplay(15000, 1);
      scoreDisplay(11500, 2);
      scoreDisplay(10000, 3);
      scoreDisplay(9000,  4);
      scoreDisplay(8000,  5);     
      scoreDisplay(7500,  6);
      scoreDisplay(7000,  7);
      gameState = "results";
    }      
  }

  if (gameState == "results"){
    if (tlob.buttonHold() > 800){
      // reset game
      gameState = "countdown";
      presses = 0;
      timer = 0;
      score = 0;
      animTimer = 0;
    }
  }

  tlob.update();
}

void binaryDisplay(int num){
  bool binary[] = {0,0,0};
  int numCopy = num;
  int i = 0;

  while (numCopy > 0){
    binary[i] = numCopy % 2;
    numCopy /= 2;
    i++;
  }

  tlob.led(2, binary[0]);
  tlob.led(1, binary[1]);
  tlob.led(0, binary[2]);
}

void scoreDisplay(int time, int points){
  if (score < time){
    tlob.ledAll(0);
    delay(200);
    binaryDisplay(points);
    delay(500);
    
  }
}