# Hardware Documentation

## Breadboard Prototype Photos

Actual photos of the assembled breadboard prototype.

| Top view | ESP32 view | Side view |
|---|---|---|
| ![Top view of the prototype](photos/prototype-top-view.jpg) | ![ESP32 board on the breadboard](photos/prototype-esp32-view.jpg) | ![Side view showing LEDs, buzzer, and MQ-137](photos/prototype-side-view.jpg) |

**What the photos show:**

- ESP32 development board (USB-C), powered through a USB cable
- MQ-137 gas sensor module mounted on the breadboard
- 3 status LEDs (green, blue, red), each with a 4.7 kΩ resistor
- Active piezo buzzer
- Jumper wires connecting the components to the ESP32

## Pin Connections

**Wiring by:** Bernadine Cabilogan

| Component | Component pin | ESP32 pin | Breadboard path |
|---|---|---|---|
| ESP32 | VIN (5 V) | — | VIN → positive (+) rail |
| ESP32 | GND | — | GND → negative (−) rail |
| MQ-137 | VCC | VIN (5 V) | b41 → positive (+) rail |
| MQ-137 | GND | GND | b42 → negative (−) rail |
| MQ-137 | AO (analog out) | **GPIO 34** (D34) | AO → resistor b45–b49 → c49 → D34 |
| MQ-137 | DO (digital out) | not connected | — |
| Green LED | anode (+) | **GPIO 25** (D25) | D25 → j21, resistor f21–f26, LED i26 (+) – i27 (−), j27 → negative rail |
| Blue LED | anode (+) | **GPIO 26** (D26) | D26 → j30, resistor f30–f34, LED i34 (+) – i35 (−), j35 → negative rail |
| Red LED | anode (+) | **GPIO 27** (D27) | D27 → j38, resistor f38–f42, LED i42 (+) – i43 (−), j43 → negative rail |
| Buzzer (active) | + (red leg) | **GPIO 14** (D14) | D14 → j46, buzzer + at g46 |
| Buzzer (active) | − (black leg) | GND | buzzer − at g49, j49 → negative rail |

**Breadboard layout:** the ESP32 sits across the breadboard. The pins on the 3V3 / GND / D15 … D23 side are on column A, and the pins on the VIN / GND / D13 … EN side are on column I. The MQ-137 module is on column A, rows 41–44.

### What each output means

These match the firmware in [`firmware/`](../../firmware/).

| Status | LED | Buzzer |
|---|---|---|
| NORMAL (no odor) | Green | Off |
| MODERATE (slight odor) | Blue | Off |
| HIGH (strong urine odor) | Red | Beeping |

## Notes and planned improvements

- **Sensor output voltage.** The MQ-137 is powered from VIN (5 V), so its AO pin can go above 3.3 V, which is the maximum for ESP32 input pins. The resistor on the AO line limits the current, but it does not lower the voltage, so readings above about 3.3 V show as the maximum value (4095). A planned improvement is a voltage divider on the AO line (for example, adding a resistor from D34 to GND) to keep the signal at or below 3.3 V.
- **LED brightness.** The LEDs use 4.7 kΩ resistors, so they are dim, especially the blue LED. Smaller resistors (220–330 Ω) would make them brighter.

## Wiring Diagram

_To be added._
