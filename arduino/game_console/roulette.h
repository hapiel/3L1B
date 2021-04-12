
class Roulette {
  public:
    TLOB tlob = TLOB(2,3,4,5);
  
    String gameState = "finished";

    unsigned long holdTimer;
    unsigned long ledTimer;
    int blinkOnDuration;
    int blinkOffDuration;
    int selected;
    int ballPos;
    float ballSpd;
    int ballStopSpd = 1200;
      

    void setup(){
        Serial.begin(9600);
      
        randomSeed(analogRead(0));
      
      }
      
      void loop() {
      
        if (gameState == "finished"){
          // button is held 800ms
          if (tlob.buttonHold > 800){
            gameState = "selection";
            selected = 0;
            ledTimer = millis();
            tlob.leds[0] = 1;
            tlob.leds[1] = 0;
            tlob.leds[2] = 0;
            blinkOnDuration = 400;
            blinkOffDuration = 100;
          }
        }
      
        if (gameState == "selection"){
      
          //select next
          if (tlob.buttonPressed){
            selected = tlob.next(selected);
            tlob.allOff();
            tlob.leds[selected] = 1;
            blinkOnDuration = 400;
            blinkOffDuration = 100;
          }
      
          // blink increasing speed
          if (tlob.leds[selected]){
            if (ledTimer < millis() - blinkOnDuration){
              tlob.leds[selected] = 0;
              ledTimer = millis();
              blinkOnDuration *= 0.85;
            }
          }
          if (!tlob.leds[selected]){
            if (ledTimer < millis() - blinkOffDuration){
              tlob.leds[selected] = 1;
              ledTimer = millis();
              blinkOffDuration *= 0.95;
            }
          }
          if (blinkOnDuration < 40){
            gameState = "selected";
            ledTimer = millis();
            tlob.leds[selected] = 1;
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