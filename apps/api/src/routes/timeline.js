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

  // Explain a care task dynamically using AI
  .get('/explain', async ({ query }) => {
    const taskName = query.task || 'this task';
    const contextType = query.context || 'general care';
    const herName = query.herName || 'the mother';
    
    try {
      const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
      if (!apiKey) return { explanation: "AI offline. Connect your LLM API to get dynamic explanations." };
      
      const prompt = `You are a SheBloom maternal care assistant for Tamil Nadu. Explain briefly (2 sentences max) to her husband why the task "${taskName}" is important for ${herName}'s health in the context of ${contextType}. Keep it highly empathetic, scientifically accurate, and mention Tamil Nadu cultural relevance if applicable.`;
      
      const response = await fetch(process.env.LLM_API_URL || 'https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'llama3-8b-8192',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { explanation: data.choices[0].message.content.trim() };
      }
    } catch (e) {
      console.error(e);
    }
    return { explanation: "Could not generate an explanation at this moment. The LLM might be unavailable." };
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
