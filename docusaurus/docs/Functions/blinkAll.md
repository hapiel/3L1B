#blinkAll()

`blinkAll([int onTime, int offTime])`

This function works the same as [blink()](blink), except that it will apply blink on all 3 leds instead of just 1.

Example usage:

```cpp
void loop() {
  
  // if the button has been pressed
  if (tlob.buttonPressed()){
    // blink all leds, 500ms on and 100ms off
    tlob.blinkAll(500, 100);
  }
  
  // if the button is held down for 1 second
  if (tlob.buttonHold > 1000) {
    // stop blinking all leds
    tlob.stopAll();
  }

  // update the button and the blinking
  tlob.update();
}
```