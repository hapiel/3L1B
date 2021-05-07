#TLOB

Constructor for the library object

Arguments: (led1 pin, led2 pin, led3 pin, button pin)

Recommended usage:
`TLOB tlob(2,3,4,5);`

The class instance will have a variable `debounceTime` which is set by default to 25, you can opt to change this value:

`tlob.debounceTime = 17`
