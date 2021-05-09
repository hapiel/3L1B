#buttonDown()

`buttonDown()`

Returns *bool*

This function returns true when the button is down, and false when the button is up. The value it returns will only update when [updateButton()](updateButton) is called.

Example:

```cpp
void loop() {
  
  // if the button is down
  if (tlob.buttonDown()){
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
