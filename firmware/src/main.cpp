#include <Arduino.h>
#include <WiFiManager.h>

#define LED_BUILTIN 8

WiFiManager wifiManager;

void setup() {
   pinMode(LED_BUILTIN, OUTPUT);
   wifiManager.autoConnect();
}

void loop() {
   // put your main code here, to run repeatedly:
   digitalWrite(LED_BUILTIN, HIGH); // turn the LED on
   delay(1000); // wait for a second
   digitalWrite(LED_BUILTIN, LOW); // turn the LED off
   delay(1000); // wait for a second
}
