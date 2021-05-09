#led()

`led(int led, [bool state])`

Returns *bool*

The led function can be use to read and write the leds or lights. 

The first argument is an integer, 0, 1 or 2 to select the led. 

The second argument is to write the state of the led and can be set to `HIGH` or `LOW`, but also to its equivalents `true` and `false` or `1` and `0`. You might see any of these systems used in the example code. If no second argument is used, this function only returns the current state of the selected led.

Example:

```cpp
void loop() {
  
  // if the button is held down
  if (tlob.buttonDown){
     // turn the first led on
    tlob.led(0, HIGH);
  } else {
    // turn the first led off
    tlob.led(0, LOW);
  }

  // update the button state
  tlob.update();
}
```

In order to toggle the led, so as to turn it on if it was off or off if it was on, you can read the current state and use `!` to get the opposite of that.

```cpp
void loop() {
  
  // if the button is pressed
  if (tlob.buttonPressed){
     // toggle the first led
    tlob.led(0, !tlob.led(0));
  } 

  // update the button state
  tlob.update();
}
```