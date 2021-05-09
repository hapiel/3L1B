#next()

`next(int position)`

Returns *int*

This function returns the next led compared to the one given in the argument, wrapping around if the 3rd led is given. `next(0)` returns 1, `next(1)` returns 2, `next(2)` returns 0. 

Example:

```cpp

int currentPosition = 0;

void loop() {
  
  // if the button has been pressed
  if (tlob.buttonPressed()){

    // turn the current led off
    tlob.led(currentPosition, LOW);
    // switch currentPosition to next led
    currentPosition = tlob.next(currentPosition);
    tlob.led(currentPosition, HIGH);
  }
  
  // updates the button
  tlob.update();
}
```