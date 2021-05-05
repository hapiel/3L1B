
class Roulette {
  public:
    
  TLOB tlob = TLOB(3,2,4,5);

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

    randomSeed(analogRead(0));

  }

  void loop() {

    if (gameState == "finished"){
      // button is held 800ms
      if (tlob.buttonReleased){
        gameState = "selection";
        selected = 2;
        ledTimer = millis();
        tlob.allOff();
        tlob.leds[2] = 1;
        // blinkOnDuration = 400;
        // blinkOffDuration = 100;
      }
    }

    if (gameState == "selection"){

      //select next
      if (tlob.buttonReleased){
        selected = tlob.next(selected);
        tlob.allOff();
        tlob.stopAll();
        tlob.leds[selected] = 1;
        tlob.blink(selected, 400, 100);
        // blinkOnDuration = 400;
        // blinkOffDuration = 100;
      }

      if (tlob.buttonHold > 700){
        gameState = "selected";
        ledTimer = millis();
        tlob.stopAll();
        tlob.allOff();
        tlob.blink(selected, 30, 50);
      }

    }

    if (gameState == "selected"){
      if (ledTimer < millis() - 2000) {
        tlob.stopAll();
        gameState = "rolling";
        ballPos = random(3);
        ballSpd = random(20);
        ledTimer = millis();
      }
    }

    if (gameState == "rolling"){
      tlob.allOff();
      if (ledTimer < millis() - ballSpd){
        // ball too slow, end game
        if (ballSpd > ballStopSpd){
          gameState = "result";
          ledTimer = millis();
        } else {
          // increase speed and go to next
          ledTimer = millis();
          ballPos = tlob.next(ballPos);
          ballSpd *= 1.1;
        }
      }
      tlob.leds[ballPos] = 1;
        
    }

    if (gameState == "result"){
      if (selected == ballPos){
        //WIN! :D
        tlob.blink(ballPos, 20);
        
      } else {
        //LOOSE :(
        tlob.blink(ballPos, 20);
        tlob.blink(selected, 200);
      }
      gameState = "resultDone";
    }
    if (gameState == "resultDone"){
      if (ledTimer < millis() - 3000){
          gameState = "finished";
          tlob.stopAll();
          tlob.allOff();
        }
    }

    tlob.update();
  }
};