#updateLeds()

This function will update the leds. This is required when using the [blink()](blink) function, or when the [leds[]](leds) variables are changed.

It is recommendable to call this function once every loop, otherwise these variables may not work as expected.

This function is called automatically if you use [update()](update).