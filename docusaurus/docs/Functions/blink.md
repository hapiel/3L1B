#blink()

`blink(int led, [int onTime, int offTime])`

This function can set a led to blink at a regular interval. 

Select a led with 0 for the first led, 1 for the middle led and 2 for the last led.

If you only enter the first argument `led` the blink time will be set to 100ms on, 100ms off.

If you enter the second argument `onTime`, then on and off time will be equal. For example, `blink(0, 500)` will turn the first led on for 500ms and then off for 500ms, creating a 1 second cycle.

If you also enter the third argument `offTime`, then you can set a sequence like `blink(0, 500, 100)` which will set the blinking to 500ms on and 100ms off.

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
  }

  // update the button and the blinking
  tlob.update();
}
```

For this function to work properly, **make sure you call** `update()` or `updateLeds()` once every loop.

To stop a led from blinking, use [stop()](stop).

When the blink starts, the **leds will always start in the on phase**. Therefore, calling blink() repeatedly will make the led appear to be on, not blinking.

Therefore this example will **NOT** make the led blink:

```cpp
void loop() {
  
  tlob.blink(1);
  tlob.update();
}
```

But this example **will work** as the setup is only called once:


```cpp
void setup(){

  tlob.blink(1);
}

void loop() {
  
  tlob.update();
}
```