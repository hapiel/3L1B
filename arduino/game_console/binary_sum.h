

// Binary calculator game, designed by Maarten and coded by Daniel
// Two binary numbers are show, you have to calculate the sum.
// Three possible answers will be shown and cycled through, click when you see the correct answer.

// this is not an example of great code.
class BinarySum {
  public:

  TLOB tlob = TLOB(3,2,4,5);

  int num1;
  int num2;
  int answers[3];

  unsigned long timeElapsed = 0;
  int ledDelay = 1000;

  int ansState;

  String gameState = "on";

  void setup() {
    randomSeed(analogRead(0));
    gameInit();
  }

  void loop() {

    
    if (millis() - timeElapsed > ledDelay && gameState == "on"){
      ansState ++;
      ansState %= 3;
      timeElapsed = millis();
      binaryDisplay(answers[ansState]);      
    }
    

    if (tlob.buttonPressed() && gameState == "on") {
      //correct answer
      if (ansState == 0){
        tlob.ledAll(0);
        for (int i = 0; i < 10; i++){
          tlob.blink(0,100);
          tlob.updateLeds();
          delay(33);
          tlob.blink(1,100);
          tlob.updateLeds();
          delay(33);
          tlob.blink(2,100);
        }
      // wrong answer              
      } else {
        for (int i = 0; i < 20; i++){
          tlob.blinkAll(30);
        }
      }
      gameState = "waiting";
      timeElapsed = millis();

    }

    if (gameState == "waiting" && timeElapsed < millis() - 2000){
      tlob.stopAll();
      tlob.ledAll(0);
      gameState = "on";
      delay(1000);
      gameInit();
    }

    tlob.update();
  }

  void gameInit(){
    // find 2 random numbers that are no larger than 8 together
    num1 = random(1, 7);
    num2 = random(1, 7 - num1);
    answers[0] = num1 + num2;
    // set 2 random answers that are not the original answer
    answers[1] = answers[0];
    answers[2] = answers[0];
    while (answers[1] == answers[0]) {
      answers[1] = random(1,8);
    }
    while (answers[2] == answers[0] || answers[2] == answers[1]) {
      answers[2] = random(1,8);
    }
    //current answer state
    ansState = random(3);
    
    //display math problem
    binaryDisplay(num1);
    delay(1600);
    tlob.ledAll(0);
    delay(400);
    binaryDisplay(num2);
    delay(1600);
    tlob.ledAll(0);
    delay(2000);
  }

  void binaryDisplay(int num){
    tlob.ledAll(0);
    int binary[] = {0,0,0};
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
};