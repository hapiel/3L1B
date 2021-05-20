#stopAll()

`stopAll()`

This function stops all leds from blinking. It works the same as [stop()](stop) but for all leds at once.

Stopping a led does not turn the led off, it stays in the state it was when stopped.

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