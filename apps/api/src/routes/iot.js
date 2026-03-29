import { Elysia } from 'elysia';

// ── Active WebSocket Connections ──────────
const doctorClients = new Set();
const caretakerClients = new Set();
const iotDevices = new Map(); // deviceId → ws

// ── Air Quality Thresholds ────────────────
const AQ_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 200,
  MODERATE: 300,
  POOR: 500
};

function classifyAirQuality(ppm) {
  if (ppm <= AQ_THRESHOLDS.EXCELLENT) return { level: 'Excellent', severity: 'safe', emoji: '🟢' };
  if (ppm <= AQ_THRESHOLDS.GOOD)      return { level: 'Good',      severity: 'safe', emoji: '🟡' };
  if (ppm <= AQ_THRESHOLDS.MODERATE)   return { level: 'Moderate',  severity: 'warning', emoji: '🟠' };
  if (ppm <= AQ_THRESHOLDS.POOR)       return { level: 'Poor',      severity: 'alert', emoji: '🔴' };
  return { level: 'Hazardous', severity: 'critical', emoji: '🟣' };
}

// ── Safe broadcast helper ─────────────────
function broadcast(clients, payload) {
  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  for (const client of clients) {
    try {
      client.send(message);
    } catch (e) {
      clients.delete(client);
    }
  }
}

export const iotRoutes = new Elysia({ prefix: '/api/iot' })

  // ── REST: Get current air quality thresholds ──
  .get('/thresholds', () => ({
    thresholds: AQ_THRESHOLDS,
    classification: [
      { range: '0–100',  level: 'Excellent',  action: 'Ideal for maternal rest' },
      { range: '101–200', level: 'Good',       action: 'Normal indoor air' },
      { range: '201–300', level: 'Moderate',   action: 'Consider ventilation' },
      { range: '301–500', level: 'Poor',       action: 'Alert — open windows' },
      { range: '500+',    level: 'Hazardous',  action: 'Immediate — move patient' }
    ]
  }))

  // ── REST: Get connected device status ──
  .get('/devices', () => ({
    doctors: doctorClients.size,
    caretakers: caretakerClients.size,
    iotDevices: Array.from(iotDevices.keys())
  }))

  // ── WebSocket: Real-time IoT Stream ──
  .ws('/stream', {
    open(ws) {
      console.log('🔌 New WebSocket Connection Opened');
    },

    message(ws, message) {
      try {
        const payload = typeof message === 'string' ? JSON.parse(message) : message;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 1. SUBSCRIPTION — Register by role
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (payload.type === 'subscribe') {
          if (payload.role === 'doctor') {
            doctorClients.add(ws);
            console.log(`✅ Doctor subscribed (${doctorClients.size} online)`);
          }
          if (payload.role === 'caretaker') {
            caretakerClients.add(ws);
            console.log(`✅ Caretaker subscribed (${caretakerClients.size} online)`);
          }
          if (payload.role === 'iotDevice') {
            const deviceId = payload.deviceId || 'unknown';
            iotDevices.set(deviceId, ws);
            console.log(`✅ IoT Device registered: ${deviceId} (${iotDevices.size} device(s))`);
          }
          return;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 2. SENSOR TELEMETRY — ESP32 environment data
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (payload.type === 'sensor_telemetry') {
          const { deviceId, patientId, data } = payload;
          const { temperature, humidity, airQualityPPM, airQualityRaw, airQualityLevel } = data || {};

          // Server-side classification (don't trust client classification blindly)
          const aqClassification = classifyAirQuality(airQualityPPM || 0);

          console.log(
            `📡 [${deviceId}] T:${temperature}°C  H:${humidity}%  ` +
            `AQ:${airQualityPPM} PPM ${aqClassification.emoji} ${aqClassification.level}`
          );

          // ── Build payloads ──

          // Doctor gets full telemetry + device metadata
          const doctorPayload = {
            event: 'environment_update',
            deviceId,
            patientId,
            timestamp: new Date().toISOString(),
            data: {
              temperature,
              humidity,
              airQuality: {
                ppm: airQualityPPM,
                raw: airQualityRaw,
                level: aqClassification.level,
                severity: aqClassification.severity
              }
            }
          };

          // Caretaker gets simplified, action-oriented data
          const caretakerPayload = {
            event: 'live_environment',
            timestamp: new Date().toISOString(),
            data: {
              temperature,
              humidity,
              airQualityPPM,
              airQualityLevel: aqClassification.level
            }
          };

          broadcast(doctorClients, doctorPayload);
          broadcast(caretakerClients, caretakerPayload);

          // ── Air Quality Alerts ──
          if (aqClassification.severity === 'alert' || aqClassification.severity === 'critical') {
            const alertPayload = {
              event: 'environment_alert',
              alertType: 'air_quality',
              severity: aqClassification.severity,
              deviceId,
              patientId,
              timestamp: new Date().toISOString(),
              message: aqClassification.severity === 'critical'
                ? `🚨 HAZARDOUS air quality detected (${airQualityPPM} PPM)! Move the patient to fresh air immediately.`
                : `⚠️ Poor air quality detected (${airQualityPPM} PPM). Please ventilate the room.`,
              data: {
                ppm: airQualityPPM,
                level: aqClassification.level
              }
            };

            console.log(`🚨 [ALERT] ${alertPayload.message}`);
            broadcast(doctorClients, alertPayload);
            broadcast(caretakerClients, alertPayload);
          }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 3. COMPLIANCE — Caretaker task log
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (payload.type === 'compliance_logged') {
          console.log(`💊 [Caretaker] Task "${payload.task}" completed`);

          broadcast(doctorClients, {
            event: 'compliance_update',
            timelineId: payload.timelineId,
            task: payload.task,
            status: 'completed',
            timestamp: new Date().toISOString()
          });
        }

      } catch (err) {
        console.error('❌ WebSocket parsing error:', err.message);
      }
    },

    close(ws) {
      doctorClients.delete(ws);
      caretakerClients.delete(ws);

      // Remove from IoT devices map
      for (const [deviceId, deviceWs] of iotDevices) {
        if (deviceWs === ws) {
          iotDevices.delete(deviceId);
          console.log(`🔌 IoT Device disconnected: ${deviceId}`);
          break;
        }
      }

      console.log('🔌 WebSocket Connection Closed');
    }
  });
