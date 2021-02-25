
int led1 = 4;
int led2 = 3;
int led3 = 2;
int leds[] = {4,3,2};

int buttonPin = 5;

String gameState;

bool buttonDown;
bool buttonPressed;
long holdTimer;
int selected;

void setup() {

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(led3, OUTPUT);

  pinMode(buttonPin, INPUT);

}

void loop() {
  // check button pressing or holding or nothing etc. No debounce yet.
  
  if (!buttonDown) {
    if (digitalRead(buttonPin)) {
      buttonPressed = true;
      holdTimer = millis();
    } else {
      buttonPressed = false;
    }
  } else {
    buttonPressed = false;
  }
  
  buttonDown = digitalRead (buttonPin);
  // button is held 800ms
  if (buttonDown && holdTimer > millis - 800){
    gameState = "selection";
    selected = 0;
    digitalWrite( led1, 0);
    digitalWrite( led2, 0);
    digitalWrite( led3, 0);
    
  }
  
}


void blinkIncr(led){

  void repeatOnOff(
}
