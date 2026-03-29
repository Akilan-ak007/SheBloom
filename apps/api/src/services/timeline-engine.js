// SheBloom — Timeline Engine Service
// Generates personalized daily care schedules based on companion schedule + trimester + conditions

export async function generateCareTimeline(schedule, trimester, conditions, herName) {
  const tasks = [];

  // ---- Schedule-based base tasks ----
  const scheduleTemplates = {
    'working-9-6': [
      { time: '06:30', task: `Ensure ${herName} takes iron + folic acid with vitamin C`, icon: 'pill', duration: '5min', gap: 'nutrition', verified: 'doctor', citation: 'WHO ANC Recommendations' },
      { time: '07:00', task: `Prepare nutrient-rich breakfast before leaving`, icon: 'utensils', duration: '20min', gap: 'nutrition', verified: 'evidence' },
      { time: '10:00', task: `Send a caring message to ${herName}`, icon: 'message-circle', duration: '2min', gap: 'emotional', verified: 'evidence', citation: 'Emotional support reduces PPD risk by 40%' },
      { time: '13:00', task: `Remind ${herName} about water intake (target: 3L today)`, icon: 'droplet', duration: '1min', gap: 'action', verified: 'doctor', citation: 'WHO recommends 2.3-3L daily during pregnancy' },
      { time: '18:30', task: `Evening walk together (20-30 min, gentle pace)`, icon: 'footprints', duration: '30min', gap: 'action', verified: 'doctor', citation: 'ACOG: 150 min/week moderate exercise' },
      { time: '19:30', task: `Cook dinner from today's meal plan`, icon: 'cooking-pot', duration: '45min', gap: 'nutrition', verified: 'evidence' },
      { time: '21:00', task: `Relaxation time + check how she's feeling emotionally`, icon: 'heart', duration: '15min', gap: 'emotional', verified: 'evidence' },
      { time: '21:30', task: `Ensure calcium supplement (separate from iron by 2hrs)`, icon: 'pill', duration: '2min', gap: 'nutrition', verified: 'doctor', citation: 'ICMR: Calcium + Iron must be taken 2 hours apart' }
    ],
    'homemaker': [
      { time: '06:30', task: `Morning supplements for ${herName} (iron + folic acid)`, icon: 'pill', duration: '5min', gap: 'nutrition', verified: 'doctor', citation: 'WHO ANC Recommendations' },
      { time: '07:30', task: `Prepare breakfast + pack healthy snacks for the day`, icon: 'utensils', duration: '30min', gap: 'nutrition', verified: 'evidence' },
      { time: '09:00', task: `Gentle morning walk or stretching together`, icon: 'footprints', duration: '20min', gap: 'action', verified: 'doctor', citation: 'ACOG: 150 min/week moderate exercise' },
      { time: '10:30', task: `Mid-morning snack (dates + almonds for iron)`, icon: 'apple', duration: '5min', gap: 'nutrition', verified: 'doctor', citation: 'NHM Anemia Mukt Bharat guidelines' },
      { time: '12:30', task: `Prepare balanced lunch`, icon: 'cooking-pot', duration: '40min', gap: 'nutrition', verified: 'evidence' },
      { time: '14:00', task: `Encourage afternoon rest (she should nap 30-60min)`, icon: 'moon', duration: '5min', gap: 'action', verified: 'evidence', citation: 'Sleep improves fetal development and maternal health' },
      { time: '16:00', task: `Hydration check + light snack`, icon: 'droplet', duration: '5min', gap: 'nutrition', verified: 'doctor' },
      { time: '17:00', task: `Listen to her - ask about how she's feeling today`, icon: 'ear', duration: '15min', gap: 'emotional', verified: 'evidence', citation: 'Active listening reduces maternal anxiety' },
      { time: '19:00', task: `Prepare dinner from meal plan`, icon: 'utensils', duration: '40min', gap: 'nutrition', verified: 'evidence' },
      { time: '21:00', task: `Evening calcium supplement`, icon: 'pill', duration: '2min', gap: 'nutrition', verified: 'doctor', citation: 'ICMR: Calcium + Iron must be taken 2 hours apart' }
    ],
    'flexible': [
      { time: '07:00', task: `Morning supplements for ${herName}`, icon: 'pill', duration: '5min', gap: 'nutrition', verified: 'doctor', citation: 'WHO ANC Recommendations' },
      { time: '08:00', task: `Prepare a nutritious breakfast together`, icon: 'utensils', duration: '20min', gap: 'nutrition', verified: 'evidence' },
      { time: '10:00', task: `Water and snack check`, icon: 'droplet', duration: '5min', gap: 'nutrition', verified: 'doctor' },
      { time: '12:00', task: `Lunch time - balanced meal`, icon: 'cooking-pot', duration: '30min', gap: 'nutrition', verified: 'evidence' },
      { time: '15:00', task: `Gentle walk or rest time`, icon: 'footprints', duration: '20min', gap: 'action', verified: 'doctor' },
      { time: '17:00', task: `Emotional check-in with ${herName}`, icon: 'heart', duration: '15min', gap: 'emotional', verified: 'evidence' },
      { time: '19:00', task: `Cook dinner from meal plan`, icon: 'utensils', duration: '40min', gap: 'nutrition', verified: 'evidence' },
      { time: '21:00', task: `Evening supplements + relaxation`, icon: 'pill', duration: '10min', gap: 'nutrition', verified: 'doctor' }
    ]
  };

  // Get base schedule or fallback to flexible
  const baseTasks = scheduleTemplates[schedule] || scheduleTemplates['flexible'];
  tasks.push(...baseTasks);

  // ---- Condition-specific overlays ----
  if (conditions.includes('anemia-mild') || conditions.includes('anemia-moderate')) {
    tasks.push({
      time: '10:30', task: `Iron-rich snack: dates + almonds + jaggery`, icon: 'apple',
      duration: '5min', gap: 'nutrition', verified: 'doctor',
      citation: 'NHM Anemia Mukt Bharat: 4 dates provide 0.9mg iron',
      condition: 'Anemia Management'
    });
  }

  if (conditions.includes('gestational-diabetes')) {
    tasks.push({
      time: '09:00', task: `Post-breakfast blood sugar check for ${herName}`, icon: 'activity',
      duration: '5min', gap: 'action', verified: 'doctor',
      citation: 'ACOG GDM Monitoring Guidelines',
      condition: 'GDM Monitoring'
    });
    tasks.push({
      time: '15:00', task: `Post-lunch glucose monitoring`, icon: 'activity',
      duration: '5min', gap: 'action', verified: 'doctor',
      citation: 'Target: <120 mg/dL 2hr post-meal',
      condition: 'GDM Monitoring'
    });
  }

  if (conditions.includes('hypertension')) {
    tasks.push({
      time: '08:00', task: `Morning BP check for ${herName} (target: <140/90)`, icon: 'heart-pulse',
      duration: '5min', gap: 'emergency', verified: 'doctor',
      citation: 'ACOG Hypertension in Pregnancy Guidelines',
      condition: 'BP Monitoring'
    });
    tasks.push({
      time: '20:00', task: `Evening BP check + swelling assessment`, icon: 'heart-pulse',
      duration: '5min', gap: 'emergency', verified: 'doctor',
      citation: 'Pre-eclampsia risk increases in T3',
      condition: 'BP Monitoring'
    });
  }

  if (conditions.includes('thyroid')) {
    tasks.push({
      time: '06:00', task: `Thyroid medication (empty stomach, 30min before food)`, icon: 'pill',
      duration: '2min', gap: 'nutrition', verified: 'doctor',
      citation: 'Thyroid meds must be taken on empty stomach',
      condition: 'Thyroid'
    });
  }

  // ---- Trimester-specific additions ----
  if (trimester >= 3) {
    tasks.push({
      time: '20:00', task: `Baby kick counting session (target: 10 kicks in 2 hours)`, icon: 'baby',
      duration: '30min', gap: 'emergency', verified: 'doctor',
      citation: 'ACOG: Report <10 kicks in 2 hours to doctor immediately'
    });
  }

  // ---- AI Contextual Overlay (Tamil Nadu Algorithm) ----
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.LLM_API_KEY;
    if (apiKey) {
      const prompt = `You are a SheBloom scheduling algorithm for Tamil Nadu. Generate exactly ONE personalized daily care task (time and task description) for a pregnant woman named ${herName}. Conditions: ${conditions.join(', ')}. Trimester: ${trimester}. The task must involve an indigenous Tamil Nadu dietary practice (e.g., Murungai Keerai for iron, Poondu Kuzhambu for lactation, etc). Return ONLY valid JSON: {"time": "11:00", "task": "Prepare Poondu Kuzhambu for lunch", "icon": "utensils"}`;
      
      const response = await fetch(process.env.LLM_API_URL || 'https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'llama3-8b-8192',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });
      if (response.ok) {
        const data = await response.json();
        const aiTask = JSON.parse(data.choices[0].message.content);
        tasks.push({
          time: aiTask.time,
          task: `🌱 [AI Tailored] ${aiTask.task}`,
          icon: aiTask.icon || 'leaf',
          duration: '15min',
          gap: 'nutrition',
          verified: 'ai-siddha',
          condition: 'Localized Tamil Care'
        });
      }
    }
  } catch (err) {
    console.error("AI Timeline Gen Failed:", err);
  }

  // Sort by time
  tasks.sort((a, b) => a.time.localeCompare(b.time));

  return tasks;
}
