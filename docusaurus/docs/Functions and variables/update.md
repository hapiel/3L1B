#update()

This function calls [updateButton()](updateButton) and [updateLeds()](updateLeds)

It is recommended to call this function at the end of every loop.

Example:

```cpp
void loop() {
  
  if (tlob.buttonDown){
    tlob.allOn();
  } else {
    tlob.allOff();
  }

  tlob.update();
}
```