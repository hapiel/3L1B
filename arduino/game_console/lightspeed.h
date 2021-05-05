
class Lightspeed {
  public:
  TLOB tlob = TLOB(3,2,4,5);


  // current position of the light
  int position = 0;
  // time since last move
  unsigned long lastTime = 0;
  // current state of the game
  String gameState = "playing";

  // GAME SETTINGS
  // starting speed
  int minSpeed = 650;
  // time between led moves.
  float speed = minSpeed;
  // the rate the speed increments or decrements when winning or loosing
  float incr = 0.8;
  float decr = 2.5;

  void setup() {
  }

  void loop() {
    
    if ( gameState == "playing" ) {
      nextLed();
      checkButton();
    }
    
    if (gameState == "pause") {
      waitToPlay();
    }
    
    tlob.update();
  }

  // switches to the next led if sufficient time has passed
  void nextLed(){
    // if more time has passed than speed
    if (millis() - lastTime > speed){
      // turn off current led
      tlob.led(position, false);
      // switch position to next led
      position = tlob.next(position);
      // turn on next led
      tlob.led(position, true);
      // record current time
      lastTime = millis();
    }
  }

  void checkButton(){
    // if the button is pressed
    if ( tlob.buttonPressed ) {
      if ( position == 1 ) {
        // win! 
        // increase speed
        speed *= incr;
        //blink middle led at quarter of speed
        tlob.blink(1, speed / 4);

      // if button is not pressed
      } else {
        // loose... 
        // decrease speed, but the lowest setting is minSpeed
        speed = min(speed * decr, minSpeed); 
        //blink all leds at half of speed
        tlob.blinkAll(speed / 2);     
      }
      // change game state so we can show blink animation
      gameState = "pause";
      // record current time
      lastTime = millis();
    }
  }

  // wait, and then set the game back to playing mode
  void waitToPlay(){
    // time waiting before going back to play is speed * 2 or at minimum 200ms
    int waitTime = max(speed * 2, 200);
    // if waitTime has passed since lastTime
    if (millis() - lastTime > waitTime){
      // stop all blinking
      tlob.stopAll();
      // turn off lights in case they were on after blinking
      tlob.allOff();
      // change back to playing mode
      gameState = "playing";
    }
  }
};