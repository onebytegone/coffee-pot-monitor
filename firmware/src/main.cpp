#include <Arduino.h>
#include <WiFiManager.h>
#include <HX711.h>

#define LED_BUILTIN 8
#define LOADCELL_DOUT_PIN 1
#define LOADCELL_SCK_PIN 2

// Adjust this value to match your calibration. To find the correct value:
//
// ```
// loadCell.set_scale();
// loadCell.tare();
// Serial.println("Place a known weight on the scale to calibrate.");
// delay(5000);
// Serial.println("Calibrating...");
// Serial.print("Measured weight: ");
// Serial.println(loadCell.get_units(10));
// Serial.println("Setup complete. Adjust LOAD_CELL_SCALE to 'measured weight / known weight'.");
// ```
#define LOAD_CELL_SCALE 428.92f

WiFiManager wifiManager;
HX711 loadCell;

void setup() {
   Serial.begin(115200);
   pinMode(LED_BUILTIN, OUTPUT);

   // Load cell setup
   loadCell.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
   loadCell.set_scale(LOAD_CELL_SCALE);
   loadCell.tare();

   // WiFi setup
   wifiManager.autoConnect();
}

void loop() {
   if (loadCell.wait_ready_timeout(1000)) {
      long reading = loadCell.get_units(5);

      Serial.print("Load cell reading: ");
      Serial.println(reading);
   } else {
      Serial.println("Load cell not found");
   }

   digitalWrite(LED_BUILTIN, HIGH); // turn the LED on
   delay(1000); // wait for a second
   digitalWrite(LED_BUILTIN, LOW); // turn the LED off
   delay(1000); // wait for a second
}
