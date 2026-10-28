import GEMINI_CONFIG from '../config/gemini.js';
import SYSTEM_PROMPT from '../config/systemPrompt.js';

const formatMessages = (messages) =>
  messages.map((m) => ({
    role:  m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

export const generateReply = async (messages) => {
  const { apiKey, model, baseUrl, generationConfig, safetySettings } = GEMINI_CONFIG;

  // Fallback to mock response if API key is not set
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set, using mock response');
    return getMockResponse(messages);
  }

  try {
    const response = await fetch(
      `${baseUrl}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: formatMessages(messages),
          generationConfig,
          safetySettings,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn(`Gemini API error ${response.status}: ${err?.error?.message || 'Falling back to mock response'}`);
      return getMockResponse(messages);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return "I'm unable to respond to that. Please rephrase or consult a healthcare professional directly.";
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) return getMockResponse(messages);

    return reply.trim();
  } catch (err) {
    console.warn('Gemini request failed, using mock fallback:', err.message);
    return getMockResponse(messages);
  }
};

// Mock response function for testing without API key or on API failure
const getMockResponse = (messages) => {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (lastMessage.includes('fever') || lastMessage.includes('temperature')) {
    return "I understand you're concerned about fever. A fever is your body's natural response to fighting infection. Here are some general recommendations:\n\n• Rest and stay hydrated\n• Take acetaminophen or ibuprofen for comfort\n• Monitor your temperature regularly\n• Seek medical attention if fever exceeds 103°F (39.4°C) or lasts more than 3 days\n\nWould you like me to help you determine if you should see a doctor?";
  } else if (lastMessage.includes('headache') || lastMessage.includes('pain')) {
    return "For headaches and pain, here are some general suggestions:\n\n• Rest in a quiet, dark room\n• Stay hydrated\n• Apply cold or warm compresses\n• Consider over-the-counter pain relievers\n\nIf your headache is severe, sudden, or accompanied by other symptoms like vision changes or confusion, please seek immediate medical attention.";
  } else if (lastMessage.includes('bmi') || lastMessage.includes('weight')) {
    return "BMI (Body Mass Index) is a screening tool that uses your height and weight to estimate body fat. A healthy BMI is typically between 18.5 and 24.9. However, BMI doesn't account for muscle mass, bone density, or overall body composition. For personalized health advice, I recommend consulting with a healthcare provider.";
  } else if (lastMessage.includes('blood pressure') || lastMessage.includes('bp')) {
    return "Normal blood pressure is typically around 120/80 mmHg. High blood pressure (hypertension) is generally considered 130/80 or higher. Regular monitoring is important for heart health. Lifestyle changes like reducing sodium intake, exercising regularly, and managing stress can help maintain healthy blood pressure levels.";
  } else {
    return "Thank you for your health question. While I can provide general health information, I'm not a substitute for professional medical advice. For specific concerns about your health, please consult with a qualified healthcare provider who can evaluate your individual situation.\n\nIs there a specific health topic you'd like to learn more about?";
  }
};