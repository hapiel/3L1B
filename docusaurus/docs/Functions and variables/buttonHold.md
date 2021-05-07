#buttonHold

*int*

An integer variable that holds the amount of milliseconds a button has been down. This number will only update when [updateButton()](updateButton) is called.

It is recommendable to treat this variable as read-only.

Example:

```cpp
void loop() {
  
  // if the button is down for 1 second
  if (tlob.buttonHold > 1000){
    tlob.allOn();
  } else {
    tlob.allOff();
  }

  // update() calls updateButton()
  tlob.update();
}
```