#include <TLOB.h>

TLOB tlob(3,2,4,5);

// ping pong game. Hit the right moment when the ball comes your way.
// UNFINISHED

int speed = 300;

unsigned long timer = 0;

// towards pc is 0, towards player = 1
bool direction = 0;

// between 0 and 4. 1 - 3 are shown on leds, 4 is when you should hit.
int position = 2;


void setup() {
}

void loop() {

  // turn on current led position
  tlob.allOff();

  if (position > 0 && position < 4){
    tlob.led(position - 1, 1);
  }

  if (timer + speed < millis()){
    // switch direction
    if (position == 3 || position == 0){
      direction = !direction;
    }

    if (direction){
      position ++;
    } else {
      position --;
    }
    timer = millis();
  }

  tlob.update();
}
