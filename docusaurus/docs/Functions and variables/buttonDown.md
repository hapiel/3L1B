#buttonDown

*bool*

A boolean variable that is true when the button is down, and false when the button is up. This variable will only update when [updateButton()](updateButton) is called.

It is recommendable to treat this variable as read-only.

Example:

```cpp
void loop() {
  
  // if the button is down
  if (tlob.buttonDown){
    tlob.allOn();
  } else {
    tlob.allOff();
  }

  // update() calls updateButton()
  tlob.update();
}
```
