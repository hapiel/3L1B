#buttonHold()

`buttonHold()`

Returns *int*

Returns an integer that holds the amount of milliseconds a button has been down. This number will only update when [updateButton()](updateButton) is called.

Example:

```cpp
void loop() {
  
  // if the button is down for 1 second
  if (tlob.buttonHold() > 1000){
    // turn all leds on
    tlob.ledAll(HIGH);
  } else {
    // turn all leds off
    tlob.ledAll(LOW);
  }

  // update() calls updateButton()
  tlob.update();
}
```