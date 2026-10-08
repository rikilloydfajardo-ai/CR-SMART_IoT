# CR-SMART IoT

**AI-Enabled IoT Odor Monitoring System with Predictive Data Analytics for the CEIT Male Restroom at CSUCC**

IoT-based restroom environmental and air quality monitoring system with AI predictive analytics.

> IT 114 — Advanced Human Computer Interaction · IoT System Project · 1st Semester, AY 2026–2027
> Caraga State University – Cabadbaran Campus (CSUCC)

---

## Group Members

| Name | GitHub |
|---|---|
| Johnny Guzon | [@guzonjohnny3](https://github.com/guzonjohnny3) |
| Riki Lloyd Fajardo | [@rikilloydfajardo-ai](https://github.com/rikilloydfajardo-ai) |
| Bernadine Cabilogan | _to be added_ |

## Project Rationale

_To be copied from the approved proposal._

## Hardware Components

| Qty | Component | Role in the system |
|---|---|---|
| 1 | ESP32 development board | Microcontroller — reads the sensor, processes data, controls the outputs |
| 1 | MQ-137 gas sensor module | Sensor — detects ammonia (NH₃), the main source of restroom odor |
| 3 | LEDs (red, blue, green) | Actuator — visual status indicators |
| 1 | Piezo buzzer (active) | Actuator — audible alert |
| 3 | 4.7 kΩ resistors | Current-limiting resistors for the LEDs |
| 1 | Breadboard | Prototype wiring |
| 13 | Jumper wires | Connections between the ESP32, sensor, and outputs |
| 1 | USB charging cable | Power and programming cable for the ESP32 |
| 1 | Power bank | Portable power supply |

## Repository Structure

```
CR-SMART_IoT/
├── README.md              # Project overview (this file)
├── firmware/              # ESP32 code (sensor reading + LED/buzzer logic)
├── dashboard/             # Web dashboard based on the approved Figma design
└── documentation/
    ├── progress.md        # Progress log (date, task, status, member)
    └── hardware/          # Wiring details and photos of the prototype
```

## Current Status

| Area | Status |
|---|---|
| Hardware | Breadboard prototype assembled (ESP32, MQ-137, 3 LEDs, buzzer) |
| Firmware | Not yet in repository |
| Dashboard | Not yet started in repository |
| AI predictive analytics | Planned |

See [`documentation/progress.md`](documentation/progress.md) for the detailed progress log.
