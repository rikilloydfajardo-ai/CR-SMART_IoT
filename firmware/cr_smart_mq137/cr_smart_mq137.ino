// =============================================================
//  MQ137 Urine / Ammonia Odor Detection - ESP32
//  CR-SMART Midterm Checkpoint
//
//  WIRING
//    MQ137 VCC  -> ESP32 VIN (5V)
//    MQ137 GND  -> ESP32 GND
//    MQ137 AO   -> 10k resistor -> ESP32 GPIO 34
//    Green LED  -> GPIO 25 (via resistor)  = NORMAL (walay baho)
//    Blue LED   -> GPIO 26 (via resistor)  = MODERATE (gamay nga baho)
//    Red LED    -> GPIO 27 (via resistor)  = HIGH (kusog nga baho sa ihi)
//    Buzzer (+) -> GPIO 14, Buzzer (-) -> GND
//
//  HOW IT WORKS
//    1. Warm-up (60 s), then measures the clean-air "baseline".
//    2. Diff = reading - baseline
//         Diff <  MODERATE_DIFF            -> NORMAL   (green)
//         MODERATE_DIFF <= Diff < HIGH     -> MODERATE (blue)
//         Diff >= HIGH_DIFF                -> HIGH     (red + buzzer)
//    3. Every RED + BUZZER detection is counted.
//       (If it stays RED, it counts again every 10 seconds.)
//       Detections within the last 1 minute:
//         4 times      -> notify admin: MODERATE
//         5 or more    -> notify admin: DANGEROUS
//
//  SERIAL MONITOR COMMANDS (115200 baud, type then Enter)
//    c = re-measure baseline (do this in clean air)
//    t = print a TEST notification in the Serial Monitor
//
//  MANUAL TRIGGER (for demo / testing - marked [MANUAL] everywhere)
//    1 = force NORMAL   (green)
//    2 = force MODERATE (blue)
//    3 = force HIGH     (red + buzzer, keeps counting every 10 s)
//    r = one RED + buzzer detection (2 seconds) - type 4 or 5 times,
//        about 3 seconds apart, to show the MODERATE / DANGEROUS alert
//    0 = manual OFF, back to the real sensor
// =============================================================

#include <WiFi.h>
#include <HTTPClient.h>

// ================== SETTINGS - USBA NI ==================
// Wi-Fi name/password, server URL and device key are kept in secrets.h,
// which is NOT uploaded to GitHub. Copy secrets.example.h to secrets.h
// and fill in your own values before uploading to the ESP32.
#include "secrets.h"

const bool  ENABLE_CLOUD  = true;    // true = send to CR-SMART, false = Serial Monitor ra
const char* DEVICE_ID     = "ESP32-MQ137-01";        // naka-register sa CR-SMART
// ========================================================

const int MQ_PIN = 34;
const int GREEN  = 25;
const int BLUE   = 26;
const int RED    = 27;
const int BUZZER = 14;

const unsigned long WARMUP_MS       = 60000;  // 60 s sensor warm-up
const unsigned long UPLOAD_EVERY_MS = 10000;  // send a reading to the system every 10 s

// How far above the baseline (ADC units, 0-4095) counts as odor.
// Adjust after testing with your actual sample.
const int MODERATE_DIFF = 150;
const int HIGH_DIFF     = 400;

// ---- Admin notification rules ----
const unsigned long WINDOW_MS  = 60000;  // count detections within 1 minute
const unsigned long REPEAT_MS  = 10000;  // staying RED counts again every 10 s
const unsigned long MIN_GAP_MS = 3000;   // ignore flicker: new detection needs 3 s gap
const int MODERATE_COUNT  = 4;           // 4 detections in 1 min  -> MODERATE
const int DANGEROUS_COUNT = 5;           // 5+ detections in 1 min -> DANGEROUS

int baseline = 0;
unsigned long lastUpload = 0;

// Detection history (last 20 detections)
const int MAX_EVENTS = 20;
unsigned long eventTimes[MAX_EVENTS];
int eventHead   = 0;
int eventStored = 0;
unsigned long lastEventTime = 0;
bool wasHigh = false;
int alertSent = 0;   // 0 = none, 1 = MODERATE sent, 2 = DANGEROUS sent

// Manual trigger
int manualMode = 0;            // 0 = real sensor, 1 = NORMAL, 2 = MODERATE, 3 = HIGH
unsigned long pulseUntil = 0;  // 'r' = short RED pulse until this time

bool manualActive() {
  return manualMode != 0 || millis() < pulseUntil;
}

// ---------------- Sensor helpers ----------------
int readSensor(int samples = 20) {
  long total = 0;
  for (int i = 0; i < samples; i++) {
    total += analogRead(MQ_PIN);
    delay(5);
  }
  return total / samples;
}

void setLeds(bool g, bool b, bool r) {
  digitalWrite(GREEN, g ? HIGH : LOW);
  digitalWrite(BLUE,  b ? HIGH : LOW);
  digitalWrite(RED,   r ? HIGH : LOW);
}

void clearDetections() {
  eventHead = 0;
  eventStored = 0;
  lastEventTime = 0;
  wasHigh = false;
  alertSent = 0;
}

void calibrateBaseline() {
  Serial.println();
  Serial.println("Measuring clean-air baseline (5 seconds)... keep odor away.");
  long total = 0;
  for (int i = 0; i < 50; i++) {
    total += readSensor(5);
    delay(100);
  }
  baseline = total / 50;
  clearDetections();
  Serial.print("Baseline = ");
  Serial.println(baseline);
  Serial.println("-----------------------------------------------");
}

// ---------------- Detection counting ----------------
void recordDetection() {
  eventTimes[eventHead] = millis();
  eventHead = (eventHead + 1) % MAX_EVENTS;
  if (eventStored < MAX_EVENTS) eventStored++;
  lastEventTime = millis();
}

int countRecentDetections() {
  int count = 0;
  unsigned long now = millis();
  for (int i = 0; i < eventStored; i++) {
    if (now - eventTimes[i] <= WINDOW_MS) count++;
  }
  return count;
}

// ---------------- WiFi / system connection ----------------
void connectWiFi() {
  if (!ENABLE_CLOUD) {
    Serial.println("Cloud disabled - notifications show in Serial Monitor only.");
    return;
  }
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi NOT connected - will keep retrying in the background.");
  }
}

// POST one raw reading to the CR-SMART server. Returns true if saved.
bool uploadReading(int raw) {
  if (!ENABLE_CLOUD) return false;
  if (raw <= 0 || raw > 4095) return false;   // server rejects these
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("  [system] WiFi not connected - not sent");
    WiFi.reconnect();
    return false;
  }
  HTTPClient http;
  http.begin(SERVER_URL);
  http.setTimeout(5000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);
  String json = String("{\"device_id\":\"") + DEVICE_ID +
                "\",\"mq137_raw\":" + raw + "}";
  int code = http.POST(json);
  String reply = http.getString();
  http.end();
  if (code == 200) {
    Serial.println("  [system] reading saved to CR-SMART");
    return true;
  }
  Serial.printf("  [system] upload failed (HTTP %d) %s\n", code, reply.c_str());
  return false;
}

// severity: "MODERATE", "DANGEROUS" or "TEST"
void notifyAdmin(const char* severity, int detections, int value, int diff) {
  String message;
  if (String(severity) == "DANGEROUS") {
    message = String("DANGEROUS: strong urine odor detected ") + detections +
              " times within 1 minute. Immediate cleaning needed!";
  } else if (String(severity) == "MODERATE") {
    message = String("MODERATE: strong urine odor detected ") + detections +
              " times within 1 minute. Please schedule cleaning.";
  } else {
    message = "TEST notification from CR-SMART sensor";
  }
  if (manualActive()) message = String("[MANUAL] ") + message;

  Serial.println();
  Serial.println("*********************************************");
  Serial.print("  ADMIN NOTIFICATION [");
  Serial.print(severity);
  Serial.println("]");
  Serial.print("  ");
  Serial.println(message);
  Serial.println("*********************************************");
  Serial.println();
}

// ---------------- Setup ----------------
void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(GREEN, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  setLeds(false, false, false);
  digitalWrite(BUZZER, LOW);

  analogReadResolution(12);                    // 0 - 4095
  analogSetPinAttenuation(MQ_PIN, ADC_11db);   // full 0 - ~3.3V range

  Serial.println();
  Serial.println("===============================================");
  Serial.println("  MQ137 URINE / AMMONIA ODOR DETECTION - ESP32");
  Serial.println("  CR-SMART Midterm Checkpoint");
  Serial.println("===============================================");

  // Self-test: Green, Blue, Red, Buzzer
  Serial.println("Self-test: Green, Blue, Red, Buzzer...");
  setLeds(true, false, false);  delay(400);
  setLeds(false, true, false);  delay(400);
  setLeds(false, false, true);  delay(400);
  setLeds(false, false, false);
  digitalWrite(BUZZER, HIGH);   delay(200);
  digitalWrite(BUZZER, LOW);

  connectWiFi();

  // Warm-up: green LED blinks, raw value printed every second
  Serial.println("Warming up sensor (60 seconds)...");
  unsigned long start = millis();
  while (millis() - start < WARMUP_MS) {
    int secondsLeft = (WARMUP_MS - (millis() - start)) / 1000;
    digitalWrite(GREEN, !digitalRead(GREEN));
    Serial.print("  warm-up ");
    Serial.print(secondsLeft);
    Serial.print("s left | raw ADC: ");
    Serial.println(readSensor());
    delay(1000);
  }
  setLeds(false, false, false);

  calibrateBaseline();
}

// ---------------- Main loop ----------------
void loop() {
  // Serial commands
  if (Serial.available()) {
    char ch = Serial.read();
    if (ch == 'c' || ch == 'C') calibrateBaseline();
    if (ch == 't' || ch == 'T') {
      int v = readSensor();
      notifyAdmin("TEST", countRecentDetections(), v, v - baseline);
    }
    if (ch == '0') { manualMode = 0; Serial.println(">> MANUAL OFF - using real sensor"); }
    if (ch == '1') { manualMode = 1; Serial.println(">> MANUAL: NORMAL (green)"); }
    if (ch == '2') { manualMode = 2; Serial.println(">> MANUAL: MODERATE (blue)"); }
    if (ch == '3') { manualMode = 3; Serial.println(">> MANUAL: HIGH (red + buzzer)"); }
    if (ch == 'r' || ch == 'R') {
      pulseUntil = millis() + 2000;
      Serial.println(">> MANUAL: one RED + buzzer detection (2 seconds)");
    }
  }

  int value = readSensor();
  int diff  = value - baseline;

  // Manual trigger overrides the sensor reading
  if (millis() < pulseUntil || manualMode == 3) diff = HIGH_DIFF;
  else if (manualMode == 2)                     diff = MODERATE_DIFF;
  else if (manualMode == 1)                     diff = 0;
  if (manualActive()) value = baseline + diff;
  bool isHigh = (diff >= HIGH_DIFF);
  const char* level;

  if (isHigh) {
    // ---- HIGH: kusog nga baho sa ihi -> RED + BUZZER ----
    level = "HIGH";
    setLeds(false, false, true);
    digitalWrite(BUZZER, (millis() / 250) % 2);   // beeping

    // Count a detection: new RED (after 3 s gap) or still RED every 10 s
    unsigned long sinceLast = millis() - lastEventTime;
    if ((!wasHigh && sinceLast >= MIN_GAP_MS) || (wasHigh && sinceLast >= REPEAT_MS)) {
      recordDetection();
    }
  } else {
    digitalWrite(BUZZER, LOW);
    if (diff >= MODERATE_DIFF) {
      // ---- MODERATE: gamay nga baho -> BLUE ----
      level = "MODERATE";
      setLeds(false, true, false);
    } else {
      // ---- NORMAL: walay baho -> GREEN ----
      level = "NORMAL";
      setLeds(true, false, false);
    }
  }
  wasHigh = isHigh;

  // ---- Admin notification based on detections in the last 1 minute ----
  int detections = countRecentDetections();
  if (detections >= DANGEROUS_COUNT && alertSent < 2) {
    notifyAdmin("DANGEROUS", detections, value, diff);
    alertSent = 2;
  } else if (detections >= MODERATE_COUNT && alertSent < 1) {
    notifyAdmin("MODERATE", detections, value, diff);
    alertSent = 1;
  } else if (detections < MODERATE_COUNT) {
    alertSent = 0;   // window cleared -> ready to notify again
  }

  // Serial Monitor output
  const char* adminStatus = (alertSent == 2) ? "DANGEROUS sent"
                          : (alertSent == 1) ? "MODERATE sent" : "-";
  Serial.printf("%sADC: %4d | Baseline: %4d | Diff: %+5d | %-8s | Red in 1 min: %d | Admin: %s\n",
                manualActive() ? "[MANUAL] " : "",
                value, baseline, diff, level, detections, adminStatus);

  // Send the real reading to the system every 10 s (never manual/demo values)
  if (ENABLE_CLOUD && !manualActive() && millis() - lastUpload >= UPLOAD_EVERY_MS) {
    lastUpload = millis();
    uploadReading(value);
  }

  delay(250);
}
