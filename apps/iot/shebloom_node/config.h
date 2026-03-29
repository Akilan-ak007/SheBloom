// ============================================
// SheBloom IoT Node — Configuration
// ============================================
// Edit YOUR values below before flashing.

#ifndef CONFIG_H
#define CONFIG_H

// ── WiFi Credentials ──────────────────────
#define WIFI_SSID     "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ── SheBloom Server ───────────────────────
// The IP of the machine running the Elysia API
// Use your computer's local IP (e.g., 192.168.1.5)
#define SERVER_HOST   "192.168.1.100"
#define SERVER_PORT   4000
#define WS_PATH       "/api/iot/stream"

// ── Device Identity ───────────────────────
#define DEVICE_ID     "shebloom-node-01"
#define PATIENT_ID    "patient-001"

// ── Pin Assignments ───────────────────────
#define DHT_PIN       4       // DHT22 DATA pin → GPIO 4
#define MQ135_PIN     34      // MQ-135 AOUT   → GPIO 34 (ADC, input-only)

// ── OLED Settings ─────────────────────────
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT 64
#define OLED_ADDR     0x3C    // Common I2C address (try 0x3D if not working)

// ── Timing ────────────────────────────────
#define SENSOR_INTERVAL_MS  5000   // Read sensors every 5 seconds
#define RECONNECT_DELAY_MS  3000   // WebSocket reconnect delay

// ── Air Quality Thresholds (PPM) ──────────
#define AQ_EXCELLENT  100
#define AQ_GOOD       200
#define AQ_MODERATE   300
#define AQ_POOR       500
// Above 500 = Hazardous

#endif
