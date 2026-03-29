import axios from 'axios';

/**
 * SheBloom Flowise Agentic Integration
 * 
 * This service connects to a locally hosted or cloud Flowise instance.
 * The Flowise agent should be configured with:
 * 1. An LLM Node (e.g., ChatOpenAI using Groq/Ollama API)
 * 2. A Prompt Template Node (Contextualizing the maternal care guidelines)
 * 3. (Optional) A Memory Node (Buffer Memory for dialogue context)
 * 4. (Optional) Tools (e.g., SERP API to search latest WHO guidelines)
 */

const FLOWISE_API_URL = process.env.FLOWISE_API_URL || 'http://localhost:3000/api/v1/prediction';
// Replace with your actual Chatflow ID from Flowise Dashboard
const CHATFLOW_ID = process.env.FLOWISE_CHATFLOW_ID || 'your-chatflow-uuid-here';
// The API Key generated in Flowise (API Keys -> DefaultKey)
const FLOWISE_API_KEY = process.env.FLOWISE_API_KEY || 'your-all-access-flowise-key';

export const agenticExplain = async (taskName, patientContext) => {
  try {
    const prompt = `As the SheBloom Empathetic Care Agent, explain to a pregnant woman's family caretaker why the following task is critical right now. 
    
    Task: "${taskName}"
    Context/Reason: "${patientContext}"
    
    Rules:
    1. Keep it under 3 sentences.
    2. Tone must be extremely warm, empathetic, and culturally appropriate (Indian context).
    3. Do not sound like a robot or a doctor giving orders.
    4. Reference how it helps the baby or the mother's comfort.`;

    const response = await axios.post(
      `${FLOWISE_API_URL}/${CHATFLOW_ID}`,
      {
        question: prompt,
        // Optional: pass session ID if you want memory to persist per caretaker
        overrideConfig: {
            sessionId: "caretaker_session_1" 
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${FLOWISE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.text;
  } catch (error) {
    console.error('Flowise Agent Error:', error?.response?.data || error.message);
    return "This task is currently prescribed by your doctor to ensure a stable, stress-free environment, directly supporting the baby's development today.";
  }
};

/**
 * Agentic Workflow for automated Doctor Leave Approval Scanning
 */
export const agenticLeaveDecision = async (caretakerMessage, doctorGuidelines) => {
    try {
        const prompt = `You are a clinical assistant analyzing a leave request from a patient's caretaker.
        Doctor Guidelines: ${doctorGuidelines}
        Request: "${caretakerMessage}"
        
        Is this request medically valid based on the guidelines? Respond with JSON: { "approved": boolean, "generatedLetter": "string (if approved, write the letter. If not, explain why to the doctor)" }`;

        const response = await axios.post(
            `${FLOWISE_API_URL}/${CHATFLOW_ID}`,
            { question: prompt },
            { headers: { 'Authorization': `Bearer ${FLOWISE_API_KEY}` } }
        );

        // Assuming Flowise returns a JSON string in this specific agent flow
        return JSON.parse(response.data.text);
    } catch (e) {
        return { approved: false, generatedLetter: "Error reaching AI Assitant for review." };
    }
}
