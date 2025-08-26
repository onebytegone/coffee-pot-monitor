#include <Arduino.h>
#include <WiFiManager.h>
#include <HX711.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Preferences.h>

#define LED_BUILTIN 8
#define BUTTON_BUILTIN 9
#define LOADCELL_DOUT_PIN 1
#define LOADCELL_SCK_PIN 2

// Adjust this value to match your calibration. To find the correct value:
//
// ```
// loadCell.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
// loadCell.set_scale();
// loadCell.tare();
// Serial.println("Place a known weight on the scale to calibrate.");
// delay(5000);
// Serial.println("Calibrating...");
// Serial.print("Measured weight: ");
// Serial.println(loadCell.get_units(10));
// Serial.println("Setup complete. Adjust LOAD_CELL_SCALE to 'measured weight / known weight'.");
// ```
#define LOAD_CELL_SCALE -427.13f

#define LOAD_CELL_READ_INTERVAL_MS 1000
#define REPORT_INTERVAL_MS 20000
#define PREFERENCE_NAMESPACE "coffee"

WiFiManager wifiManager;
HX711 loadCell;
WiFiClientSecure wifiClientSecure;
HTTPClient httpsClient;
Preferences preferences;

char apiDomain[64];
char deviceToken[1024];
bool shouldSaveConfig = false;

unsigned long lastSensorRead = 0;
unsigned long lastReport = 0;
unsigned long wifiResetPressStart = 0;

void saveConfigCallback() {
   shouldSaveConfig = true;
}

void persistConfig(const char *domain, const char *token) {
   if (!shouldSaveConfig) {
      return;
   }

   strcpy(apiDomain, domain);
   strcpy(deviceToken, token);

   preferences.begin(PREFERENCE_NAMESPACE, false);
   preferences.putString("apiDomain", apiDomain);
   preferences.putString("deviceToken", deviceToken);
   preferences.end();
}

void setup() {
   Serial.begin(115200);
   Serial.println("Coffee Pot Monitor Starting...");

   pinMode(LED_BUILTIN, OUTPUT);
   pinMode(BUTTON_BUILTIN, INPUT_PULLUP);

   loadCell.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
   loadCell.set_scale(LOAD_CELL_SCALE);
   loadCell.tare();

   preferences.begin(PREFERENCE_NAMESPACE, false);
   preferences.getString("apiDomain", apiDomain, sizeof(apiDomain));
   preferences.getString("deviceToken", deviceToken, sizeof(deviceToken));
   preferences.end();

   WiFiManagerParameter apiDomainParam("domain", "API Domain", apiDomain, 64);
   WiFiManagerParameter deviceTokenParam("token", "Device Token", deviceToken, 1024);

   wifiManager.addParameter(&apiDomainParam);
   wifiManager.addParameter(&deviceTokenParam);
   wifiManager.setSaveConfigCallback(saveConfigCallback);
   wifiManager.autoConnect();
   wifiClientSecure.setInsecure(); // Accept all certificates

   persistConfig(apiDomainParam.getValue(), deviceTokenParam.getValue());
}

void loop() {
   if (digitalRead(BUTTON_BUILTIN) == LOW) {
      if (wifiResetPressStart == 0) {
         wifiResetPressStart = millis();
      } else if (millis() - wifiResetPressStart > 5000) {
         Serial.println("Resetting WiFi settings...");
         wifiManager.resetSettings();
         ESP.restart();
      }
   } else {
      wifiResetPressStart = 0;
   }

   if (millis() - lastSensorRead > LOAD_CELL_READ_INTERVAL_MS) {
      if (loadCell.wait_ready_timeout(1000)) {
         long reading = loadCell.get_units(5);

         Serial.print("Load cell reading: ");
         Serial.println(reading);

         lastSensorRead = millis();

         if (millis() - lastReport > REPORT_INTERVAL_MS) {
            if (httpsClient.begin(wifiClientSecure, "https://" + String(apiDomain) + "/device/report")) {
               httpsClient.addHeader("Content-Type", "application/json");
               httpsClient.addHeader("Authorization", "Bearer " + String(deviceToken));

               int statusCode = httpsClient.POST(
                  "{\"reports\":[{\"sensors\":[{\"id\":\"main\",\"type\":\"weight\",\"value\":\"" + String(reading) + "\"}]}]}"
               );

               if (statusCode == 200) {
                  Serial.println("[HTTPS] POST successful");
               } else {
                  Serial.println("https://" + String(apiDomain) + "/device/report");
                  Serial.println(deviceToken);
                  Serial.printf("[HTTPS] POST failed: %i %s\n", statusCode, httpsClient.getString());
               }
               httpsClient.end();
               lastReport = millis();
            } else {
               Serial.println("[HTTPS] Unable to connect");
            }
         }
      } else {
         Serial.println("Load cell not found");
      }
   }
}
