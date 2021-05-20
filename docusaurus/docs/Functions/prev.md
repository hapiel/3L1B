#prev()

`prev(int position)`

Returns *int*

This function returns the previous led compared to the one given in the argument, wrapping around if the 0th led is given. `prev(2)` returns 1, `prev(1)` returns 0, `prev(0)` returns 2. 

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