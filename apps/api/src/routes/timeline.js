// SheBloom — Timeline Routes
import { Elysia, t } from 'elysia';
import { generateCareTimeline } from '../services/timeline-engine.js';

export const timelineRoutes = new Elysia({ prefix: '/api/timeline' })
  // Get today's care timeline
  .get('/today', async ({ query }) => {
    const schedule = query.schedule || 'flexible';
    const trimester = parseInt(query.trimester) || 1;
    const conditions = query.conditions ? query.conditions.split(',') : [];
    const herName = query.herName || 'her';

    const timeline = await generateCareTimeline(schedule, trimester, conditions, herName);
    return {
      date: new Date().toISOString().split('T')[0],
      schedule,
      trimester,
      totalTasks: timeline.length,
      conditionSpecificTasks: timeline.filter(t => t.condition).length,
      tasks: timeline
    };
  }, {
    detail: { tags: ['Timeline'], summary: 'Get today\'s personalized care timeline' }
  })

  // Mark task as done
  .post('/complete', ({ body }) => {
    return {
      success: true,
      taskId: body.taskId,
      completedAt: new Date().toISOString()
    };
  }, {
    body: t.Object({
      taskId: t.String(),
      circleId: t.Optional(t.Number())
    }),
    detail: { tags: ['Timeline'], summary: 'Mark a timeline task as completed' }
  });
