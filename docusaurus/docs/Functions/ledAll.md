#ledAll()

`ledAll(bool state)`

The led function can be use to read and write all leds or lights at once. It functions similar to [led()](led). 

The state argument is to write the state of the led and can be set to `HIGH` or `LOW`, but also to its equivalents `true` and `false` or `1` and `0`. You might see any of these systems used in the example code. 

Example:

```cpp
void loop() {
  
  // if the button is held down
  if (tlob.buttonDown){
     // turn all leds on
    tlob.ledAll(HIGH);
  } else {
    // turn all leds off
    tlob.ledAll(LOW);
  }

  // update the button state
  tlob.update();
}
```