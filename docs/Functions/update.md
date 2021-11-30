#update()

`update()`

This function calls [updateButton()](updateButton) and [updateLeds()](updateLeds)

It is recommended to call this function at the end of every loop.

Example:

```cpp
void loop() {
  
  if (tlob.buttonDown){
     // turn all leds on
    tlob.ledAll(HIGH);
  } else {
    // turn all leds off
    tlob.ledAll(LOW);
  }

  tlob.update();
}
```