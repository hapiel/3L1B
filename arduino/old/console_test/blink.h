// default blink example

class BlinkExample {
  public:
    TLOB TLOB2 = TLOB(2,3,4,5);
    int delayTime = 500;
    void setup() {
      pinMode(LED_BUILTIN, OUTPUT);
    };
    void loop() {
      TLOB2.led(1, 0);
      delay(delayTime);
      TLOB2.led(1, 1);
      delay(delayTime);
    };
};


