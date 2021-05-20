#debounceTime()

`debounceTime([int time])`

Returns the debounce time in ms

When this function is called with no argument `debounceTime()` it will just return the current debounce time, which is 15ms by default. When the function is called with an argument `debounceTime(100)` it sets the new debounce time. This can be useful if you have bad buttons that need longer debounce time, or good buttons and need more accuracy.