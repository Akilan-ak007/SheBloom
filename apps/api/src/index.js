// SheBloom — Elysia API Server
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth.js';
import { caretakerRoutes } from './routes/caretaker.js';
import { timelineRoutes } from './routes/timeline.js';
import { recoveryRoutes } from './routes/recovery.js';
import { doctorRoutes } from './routes/doctor.js';
import { iotRoutes } from './routes/iot.js';
import { cron } from '@elysiajs/cron';
import { checkMissedMedications } from './services/alert-engine.js';

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'SheBloom API',
        version: '1.0.0',
        description: 'Doctor Verified Maternal Care Companion API — bridging the care circle between doctors, caretakers, and maternal persons.'
      },
      tags: [
        { name: 'Auth', description: 'Authentication & registration' },
        { name: 'Caretaker', description: 'Caretaker dashboard & actions' },
        { name: 'Timeline', description: 'Daily care timeline engine' },
        { name: 'Recovery', description: 'Postpartum recovery & PPD screening' }
      ]
    }
  }))
  // Health check
  .get('/', () => ({
    name: 'SheBloom API',
    version: '1.0.0',
    status: 'healthy',
    message: 'Doctor Verified Maternal Care Companion'
  }))
  // Route groups
  .use(authRoutes)
  .use(caretakerRoutes)
  .use(timelineRoutes)
  .use(recoveryRoutes)
  .use(doctorRoutes)
  .use(iotRoutes)
  .use(
    cron({
      name: 'Agentic Alert Engine',
      pattern: '*/1 * * * *', // Run every minute
      run() {
        if (app.server) {
          checkMissedMedications(app.server);
        }
      }
    })
  )
  .listen({ port: 4000, hostname: '0.0.0.0' });

console.log(`🌱 SheBloom API running at http://0.0.0.0:${app.server.port}`);
console.log(`📖 Swagger docs at http://localhost:${app.server.port}/swagger`);
console.log(`📡 IoT devices can connect at ws://10.135.177.124:${app.server.port}/api/iot/stream`);
