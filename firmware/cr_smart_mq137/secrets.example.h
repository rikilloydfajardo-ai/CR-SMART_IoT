// secrets.example.h — template for secrets.h
//
// HOW TO USE
//   1. Make a copy of this file in the same folder and name it secrets.h
//   2. Put your real Wi-Fi name, password, server URL and device key in secrets.h
//
// secrets.h is listed in .gitignore, so it is never uploaded to GitHub.

#pragma once

const char* WIFI_SSID     = "your-wifi-name";
const char* WIFI_PASSWORD = "your-wifi-password";
const char* SERVER_URL    = "http://<server-ip>/IoTHCI/php/api/sensor_data.php";
const char* DEVICE_KEY    = "your-device-api-key";   // DEVICE_API_KEY sa .env sa server
