#buttonReleased()

`buttonReleased()`

Returns *bool*

This function returns a boolean that is true during the loop that the button is released, and false otherwise. It will only read as true until [updateButton()](updateButton) is called again. This makes it useful for triggering an action.

Example:

```cpp
void loop() {
  
  // if the button has been released
  if (tlob.buttonReleased()){
    tlob.blinkAll();
  }
  
  if (tlob.buttonHold > 1000) {
    tlob.stopAll();
  }

  // update() calls updateButton()
  tlob.update();
}
```

buttonReleased() is debounced, see [debounceTime()](debounceTime) to change the debounce time.