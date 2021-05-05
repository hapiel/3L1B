
int led1Pin = 4;
int led2Pin = 3;
int led3Pin = 2;
bool leds[] = {false,false,false};


int buttonPin = 5;

String gameState = "finished";

bool buttonDown;
bool buttonPressed;
unsigned long holdTimer;
unsigned long ledTimer;
unsigned long ledTimer2;
unsigned long ledTimer3;
int blinkOnDuration;
int blinkOffDuration;
int selected;
int ballPos;
float ballSpd;
int ballStopSpd = 1200;

// in c++ I have to declare function before using, but in arduino I don't?
void updateLeds(){
  digitalWrite( led1Pin, leds[0]);
  digitalWrite( led2Pin, leds[1]);
  digitalWrite( led3Pin, leds[2]);
}

// does it matter if this is at the start or end of loop()?
void updateButton(){
    // check button pressing or holding or nothing etc. No debounce yet.
  
  if (!buttonDown) {
    if (digitalRead(buttonPin)) {
      buttonPressed = true;
      holdTimer = millis();
    } else {
      buttonPressed = false;
      holdTimer = millis();
    }
  } else {
    buttonPressed = false;
  }

  buttonDown = digitalRead (buttonPin);
}

void setup() {
  Serial.begin(9600);

  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(led3Pin, OUTPUT);

  pinMode(buttonPin, INPUT);

  randomSeed(analogRead(0));

}

void loop() {
  updateButton();

  Serial.println(buttonPressed);

  if (gameState == "finished"){
    // button is held 800ms
    if (buttonDown && holdTimer < millis() - 800){
      gameState = "selection";
      selected = 0;
      ledTimer = millis();
      leds[0] = 1;
      leds[1] = 0;
      leds[2] = 0;
      blinkOnDuration = 400;
      blinkOffDuration = 100;
    }
  }

  if (gameState == "selection"){

    //select next
    if (buttonPressed){
      selected = (selected + 1) % 3;
      leds[0] = 0;
      leds[1] = 0;
      leds[2] = 0;
      leds[selected] = 1;
      blinkOnDuration = 400;
      blinkOffDuration = 100;
    }

    // blink increasing speed
    if (leds[selected]){
      if (ledTimer < millis() - blinkOnDuration){
        leds[selected] = 0;
        ledTimer = millis();
        blinkOnDuration *= 0.85;
      }
    }
    if (!leds[selected]){
      if (ledTimer < millis() - blinkOffDuration){
        leds[selected] = 1;
        ledTimer = millis();
        blinkOffDuration *= 0.95;
      }
    }
    if (blinkOnDuration < 40){
      gameState = "selected";
      ledTimer = millis();
      leds[selected] = 1;
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
    leds[0] = 0;
    leds[1] = 0;
    leds[2] = 0;
    if (ledTimer < millis() - ballSpd){
      // ball too slow, end game
      if (ballSpd > ballStopSpd){
        gameState = "result";
        ledTimer = millis();
        ledTimer2 = millis();
        ledTimer3 = millis();
      } else {
        // increase speed and go to next
        ledTimer = millis();
        ballPos = (ballPos + 1) % 3;
        ballSpd *= 1.1;
      }
    }
    leds[ballPos] = 1;
      
  }

  if (gameState == "result"){
    if (selected == ballPos){
      //WIN! :D
      if (ledTimer < millis() - 20){
        leds[ballPos] = !leds[ballPos];
        ledTimer = millis();
      }
      
    } else {
      //LOOSE :(
      if (ledTimer < millis() - 20){
        leds[ballPos] = !leds[ballPos];
        ledTimer = millis();
      }
      if (ledTimer2 < millis() - 200){
        leds[selected] = !leds[selected];
        ledTimer2 = millis();
      }
    }
    if (ledTimer3 < millis() - 3000){
      gameState = "finished";
      leds[0] = 0;
      leds[1] = 0;
      leds[2] = 0;
    }
  }

  updateLeds();
}


