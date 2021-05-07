#buttonReleased

*bool*

A boolean variable that is true during the loop that the button is released, and false otherwise. It will only read as true until [updateButton()](updateButton) is called again. This makes it useful for triggering an action.

It is recommendable to treat this variable as read-only.

Example:

```cpp
void loop() {
  
  // if the button has been released
  if (tlob.buttonReleased){
    tlob.blinkAll();
  }
  
  if (tlob.buttonHold > 1000) {
    tlob.stopAll();
  }

  // update() calls updateButton()
  tlob.update();
}
```

buttonReleased is debounced, see [TLOB](tlob) to change the debounce time.