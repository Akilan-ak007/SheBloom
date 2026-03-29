SheBloom: Empathetic AI-Driven Clinical Maternal Care Ecosystem

1. Problem Statement
Maternal mortality and postnatal complications (like Postpartum Depression - PPD, Gestational Diabetes, and Anemia) remain significantly high, especially in semi-urban and rural areas. The core issues are:
- Fragmented Care: Doctors see patients for 15 minutes a month. The remaining 99% of care falls on untrained family caretakers (husbands, mothers).
- Information Overload & Anxiety: Family members are overwhelmed with complex medical instructions, leading to missed medications, improper diets, and anxiety.
- Lack of Real-time Monitoring: Minor issues (like fluctuating room temperatures or missed iron pills) escalate into emergencies because there is no localized, real-time alert system bridging the gap between the clinic and the home.
- Cold Clinical Apps: Existing apps are generic trackers that lack cultural nuance, empathy, and direct integration with the patient's actual doctor.

2. The Solution: SheBloom
SheBloom is a closed-loop, dual-interface clinical ecosystem that connects Obstetricians directly to the patient's family caretaker through an Empathetic AI Agent and IoT monitoring.
- For the Doctor (Clinical Hub): A comprehensive dashboard to manage prescriptions, approve AI-generated diet plans, monitor real-time compliance, and handle leave/diet requests.
- For the Caretaker (Mobile-First Web App): A warm, anxiety-reducing interface that translates complex medical jargon into simple, actionable daily timelines, verified by their specific doctor.
- The AI Companion: Our own proprietary Custom LLM agent that doesn't just send cold alerts, but explains why a task is important using culturally resonant, empathetic dialogue (e.g., explaining localized Tamil Nadu dietary benefits).

3. Innovation & USP (Unique Selling Proposition)
- Agentic Alert Engine: Moves beyond static push notifications. If a caretaker misses giving a medication, the AI agent proactively triggers a localized audio alert (via WebSocket) to the caretaker's device, maintaining a warm tone ("Priya needs her iron pill to keep the baby strong today").
- "Explain" AI Feature: Caretakers can click "AI Explain" on any medical task or meal. The AI cross-references WHO guidelines and the Doctor's notes to explain the "Why" in simple, emotional terms, driving compliance through understanding rather than command.
- IoT Environmental Sync: Integrates dynamically with ESP32 sensors to monitor room temperature, humidity, and air quality (AQI), alerting the caretaker if the environment becomes hostile for a pregnant woman.
- Zero-Hallucination Guardrails: AI suggestions (like meal plans) must be approved by the Doctor via the "AI Approvals" dashboard before reaching the caretaker.

4. Tech Stack
- Frontend: Next.js (React), Vanilla CSS (Custom Design System avoiding generic aesthetics), Lucide Icons.
- Backend: Node.js, Express, WebSockets for ultra-low latency alerts.
- Database: Supabase / PostgreSQL - Structured for strict Patient-Wise Data Isolation.
- AI & Agentic Layer: Our own custom-trained Proprietary LLM utilizing dynamic prompt engineering contextualized with WHO/ICMR guidelines for absolute privacy and accuracy.
- Hardware: ESP32 Microcontroller for IoT environmental telemetry.
- Architecture: Turborepo Monorepo (apps/web, apps/api, apps/iot).

5. AI Architecture & Agentic Flow
The "Explain" Agent Flow:
1. Trigger: Caretaker clicks "Explain" on a scheduled task (e.g., "Take Folic Acid").
2. Context Gathering: System pulls Data: Patient Trimester, Current Condition (e.g., Anemia), Doctor's Rx Notes, Time of Day.
3. Prompt Injection: "Explain to a worried husband why his 2nd-trimester wife must take Folic Acid now. Use empathetic tone. Limit to 3 sentences."
4. LLM Inference: Our Proprietary LLM processes the prompt securely.
5. Guardrail Check: Ensure no medical advice is given that contradicts the Rx.
6. Delivery: Streamed gracefully into the UI.

The Alert Agent Flow:
1. Cron/IoT Trigger: Backend detects a missed medication timestamp or a spike in Room Temperature.
2. Agentic Decision: AI decides the severity. Minor = UI Notification. High = WebSocket push.
3. Execution: WebSocket sends localized Tamil audio packet + JSON payload to the Caretaker's phone.

6. Target Users & Why They Prefer SheBloom
A. The Obstetrician / Clinic (B2B User)
- Why Doctors Prefer It: Doctors face burnout from answering repetitive questions ("Can she eat papaya?", "I lost the prescription"). SheBloom organizes this into "General Requests." Furthermore, better home compliance means better clinical outcomes and lower liability. The UI is designed as a professional "Clinical Hub," not a toy.

B. The Family Caretaker (End User)
- Why Caretakers Prefer It: Pregnancy is terrifying for first-time fathers or family members. They don't want a clinical spreadsheet; they want a companion. SheBloom uses a warm color palette, avoids medical panic, and uses AI to explain why they are doing things, turning them into capable caregivers instead of anxious bystanders.

7. Impact & Benefits
- Clinical: 40% expected increase in medication adherence due to empathetic tracking.
- Psychological: Significant reduction in postpartum and antenatal anxiety for the family.
- Operational: Saves clinics 2+ hours daily in patient follow-up communication.
- Societal: Bridges the maternal healthcare gap in Tier 2/3 cities by empowering local caretakers with expert-level, localized knowledge.
