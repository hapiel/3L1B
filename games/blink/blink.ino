int pins[] = { 2, 3, 4 };

// the setup function runs once when you press reset or power the board
void setup() {
  // initialize digital pin LED_BUILTIN as an output.
  for(int i = 0; i < 3; i++) {
    pinMode(pins[i], OUTPUT);
  }
}

// the loop function runs over and over again forever
void loop() {
  for(int i = 0; i < 3; i++) {
    digitalWrite(pins[i], HIGH); 
  }
  // turn the LED on (HIGH is the voltage level)
  delay(1000); // wait for a second
  for(int i = 0; i < 3; i++) {
    digitalWrite(pins[i], LOW); 
  }   // turn the LED off by making the voltage LOW
  delay(1000); // wait for a second
}