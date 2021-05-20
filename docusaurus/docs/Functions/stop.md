#stop()

`stop(int led)`

This function stops a blinking led from blinking. The first argument is to signify which led to stop, 0, 1 or 2.

Stopping a led does not turn the led off, it stays in the state it was when stopped.

Example usage:

```cpp
void loop() {
  
  // if the button has been pressed
  if (tlob.buttonPressed()){
    // blink led 1 (middle led), 500ms on and 100ms off
    tlob.blink(1, 500, 100);
  }
  
  // if the button is held down for 1 second
  if (tlob.buttonHold > 1000) {
    // stop blinking led 1
    tlob.stop(1);
    // turn led 1 off
    tlob.led(1, LOW);
  }

  // update the button and the blinking
  tlob.update();
}