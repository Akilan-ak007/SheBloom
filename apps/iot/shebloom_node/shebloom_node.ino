// ================================================================
//  SheBloom IoT Node — Maternal Environment Monitor
// ================================================================
//  Hardware:
//    • ESP32 Dev Board + Expansion Board
//    • DHT22  (3-pin: VCC→3.3V, DATA→GPIO4, GND→GND)
//    • MQ-135 (VCC→5V, GND→GND, AOUT→GPIO34)
//    • 0.96" OLED SSD1306 I2C (expansion board header)
//
//  Libraries (Arduino Library Manager):
//    Adafruit SSD1306, Adafruit GFX, DHT sensor library,
//    Adafruit Unified Sensor, ArduinoJson, WebSockets
//
//  Board: ESP32 Dev Module
// ================================================================

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ══════════════════════════════════════════
//  CONFIGURATION — Edit these values
// ══════════════════════════════════════════
#define WIFI_SSID         "Monarch"
#define WIFI_PASSWORD     "Retriever"

#define SERVER_HOST       "10.135.177.124"
#define SERVER_PORT       4000
#define WS_PATH           "/api/iot/stream"

#define DEVICE_ID         "shebloom-node-01"
#define PATIENT_ID        "patient-001"

#define DHT_PIN           4
#define MQ135_PIN         34

#define SCREEN_WIDTH      128
#define SCREEN_HEIGHT     64
#define OLED_ADDR         0x3C

#define SENSOR_INTERVAL   5000
#define RECONNECT_DELAY   3000

#define AQ_EXCELLENT      100
#define AQ_GOOD           200
#define AQ_MODERATE       300
#define AQ_POOR           500

// ══════════════════════════════════════════
//  OBJECTS & STATE
// ══════════════════════════════════════════
DHT dht(DHT_PIN, DHT22);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
WebSocketsClient webSocket;

float temperature    = 0.0;
float humidity       = 0.0;
int   airRaw         = 0;
int   airPPM         = 0;
String airLevel      = "---";
bool  wsConnected    = false;
unsigned long lastRead = 0;

// ══════════════════════════════════════════
//  OLED SCREENS
// ══════════════════════════════════════════
void showBootScreen() {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 8);
  display.println(F("SheBloom"));
  display.setTextSize(1);
  display.setCursor(20, 35);
  display.println(F("Environment Node"));
  display.setCursor(30, 52);
  display.println(F("Starting..."));
  display.display();
  delay(2000);
}

void updateDisplay() {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print(F("SheBloom"));
  display.setCursor(90, 0);
  if (wsConnected)                     display.print(F("[LIVE]"));
  else if (WiFi.status() == WL_CONNECTED) display.print(F("[WiFi]"));
  else                                 display.print(F("[OFF]"));

  display.drawLine(0, 10, 128, 10, SSD1306_WHITE);

  // Temperature
  display.setTextSize(1);
  display.setCursor(0, 14);
  display.print(F("Temp:"));
  display.setTextSize(2);
  display.setCursor(0, 24);
  display.print(temperature, 1);
  display.setTextSize(1);
  display.print(F(" C"));

  // Humidity
  display.setCursor(80, 14);
  display.print(F("Humid:"));
  display.setTextSize(2);
  display.setCursor(80, 24);
  display.print(humidity, 0);
  display.setTextSize(1);
  display.print(F("%"));

  display.drawLine(0, 40, 128, 40, SSD1306_WHITE);

  // Air Quality
  display.setCursor(0, 44);
  display.print(F("Air: "));
  display.print(airPPM);
  display.print(F(" PPM"));

  display.setCursor(0, 55);
  if (airPPM <= AQ_EXCELLENT)     display.print(F(">> Excellent"));
  else if (airPPM <= AQ_GOOD)     display.print(F(">> Good"));
  else if (airPPM <= AQ_MODERATE)  display.print(F(">> Moderate !"));
  else if (airPPM <= AQ_POOR)      display.print(F(">> POOR !!"));
  else {
    if ((millis() / 500) % 2 == 0) display.print(F("!! HAZARDOUS !!"));
  }

  display.display();
}

// ══════════════════════════════════════════
//  WIFI
// ══════════════════════════════════════════
void connectWiFi() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("Connecting WiFi..."));
  display.setCursor(0, 16);
  display.println(WIFI_SSID);
  display.display();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    display.setCursor(attempts * 3, 32);
    display.print(".");
    display.display();
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println(F("WiFi Connected!"));
    display.setCursor(0, 16);
    display.print(F("IP: "));
    display.println(WiFi.localIP());
    display.display();
    delay(1500);
  } else {
    Serial.println("\nWiFi FAILED!");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println(F("WiFi FAILED!"));
    display.setCursor(0, 16);
    display.println(F("Check credentials"));
    display.display();
    delay(3000);
  }
}

// ══════════════════════════════════════════
//  WEBSOCKET
// ══════════════════════════════════════════
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      wsConnected = false;
      Serial.println("[WS] Disconnected");
      break;

    case WStype_CONNECTED: {
      wsConnected = true;
      Serial.println("[WS] Connected to SheBloom API");
      JsonDocument doc;
      doc["type"]     = "subscribe";
      doc["role"]     = "iotDevice";
      doc["deviceId"] = DEVICE_ID;
      String msg;
      serializeJson(doc, msg);
      webSocket.sendTXT(msg);
      Serial.println("[WS] Registered as IoT device");
      break;
    }

    case WStype_TEXT:
      Serial.printf("[WS] Server: %s\n", payload);
      break;

    default:
      break;
  }
}

void connectWebSocket() {
  Serial.printf("[WS] Connecting to %s:%d%s\n", SERVER_HOST, SERVER_PORT, WS_PATH);
  webSocket.begin(SERVER_HOST, SERVER_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(RECONNECT_DELAY);
}

// ══════════════════════════════════════════
//  SENSORS
// ══════════════════════════════════════════
void readDHT() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;
  if (isnan(t) || isnan(h)) Serial.println("[DHT] Read failed");
}

void readAirQuality() {
  airRaw = analogRead(MQ135_PIN);
  airPPM = map(airRaw, 0, 4095, 0, 1000);

  if (airPPM <= AQ_EXCELLENT)      airLevel = "Excellent";
  else if (airPPM <= AQ_GOOD)      airLevel = "Good";
  else if (airPPM <= AQ_MODERATE)   airLevel = "Moderate";
  else if (airPPM <= AQ_POOR)       airLevel = "Poor";
  else                              airLevel = "HAZARDOUS";
}

// ══════════════════════════════════════════
//  TELEMETRY
// ══════════════════════════════════════════
void sendTelemetry() {
  if (!wsConnected) return;

  JsonDocument doc;
  doc["type"]      = "sensor_telemetry";
  doc["deviceId"]  = DEVICE_ID;
  doc["patientId"] = PATIENT_ID;

  JsonObject data    = doc["data"].to<JsonObject>();
  data["temperature"]     = round(temperature * 10.0) / 10.0;
  data["humidity"]        = round(humidity * 10.0) / 10.0;
  data["airQualityPPM"]   = airPPM;
  data["airQualityRaw"]   = airRaw;
  data["airQualityLevel"] = airLevel;

  String payload;
  serializeJson(doc, payload);
  webSocket.sendTXT(payload);

  Serial.printf("[TX] T:%.1fC  H:%.1f%%  AQ:%d PPM (%s)\n",
                temperature, humidity, airPPM, airLevel.c_str());
}

// ══════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println("\n=============================");
  Serial.println("  SheBloom IoT Node v1.0");
  Serial.println("=============================\n");

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("[OLED] Init failed!");
  } else {
    Serial.println("[OLED] Ready");
    showBootScreen();
  }

  dht.begin();
  Serial.println("[DHT22] Ready");

  pinMode(MQ135_PIN, INPUT);
  Serial.println("[MQ135] Ready on GPIO 34");

  connectWiFi();
  connectWebSocket();

  Serial.println("\n[READY] SheBloom node is live!\n");
}

// ══════════════════════════════════════════
//  LOOP
// ══════════════════════════════════════════
void loop() {
  webSocket.loop();

  if (millis() - lastRead >= SENSOR_INTERVAL) {
    lastRead = millis();
    readDHT();
    readAirQuality();
    updateDisplay();
    sendTelemetry();
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Lost — reconnecting...");
    connectWiFi();
    connectWebSocket();
  }
}
