#include <TLOB.h>

TLOB tlob(2,3,4,5);

// ping pong game. Hit the right moment when the ball comes your way.

int speed = 350;

unsigned long timer = 0;

// towards pc is false, towards player = true
bool direction = false;

// between 0 and 4. 1 - 3 are shown on leds, 3 is when you should hit.
int position = 3;

String gameState = "serve";

void setup() {
  randomSeed(analogRead(A0));
  Serial.begin(9600);
}

void loop() {

  if (gameState == "serve"){
    tlob.led(2, true);
    position = 3;
    direction = true;
    speed = 350;
    if (tlob.buttonPressed()){
      gameState = "playing";
    }
  }

  // turn on current led position
  if (gameState == "playing"){
    if (timer + speed < millis()){
      // switch direction
      if (position == 0 || position == 3){
        direction = !direction;
      }

      if (direction){
        position ++;
      } else {
        position --;
      }
      timer = millis();
      if (position == 3){
        gameState = "hold";
      }
    }

    tlob.ledAll(false);

    tlob.led(position - 1, true);
  }

  if (gameState == "hold"){
    if (timer + speed < millis()){
      timer = millis();
      tlob.ledAll(false);
      tlob.blinkAll(400,50);
      gameState = "lose";
    }
    // if pressed or not held down too long ago
    if (tlob.buttonPressed() || tlob.buttonHold() < 40 && tlob.buttonHold() > 1){
      gameState = "playing";
      // increase speed randomly
      speed = random(50 + speed * 0.25 , min(speed * 1.4, 400));
      Serial.println(speed);

    }
  }

  if (gameState == "lose"){
    if (timer + 2000 < millis()){
      tlob.stopAll();
      tlob.ledAll(false);
      gameState = "serve";
    }
  }

  tlob.update();
}
