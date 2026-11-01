import '../config/env.js';

const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY,
  model:  'gemini-3.5-flash-lite', // Updated to recommended model
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 800,
    topP: 0.9,
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ],
};

console.log('GEMINI_CONFIG loaded with model:', GEMINI_CONFIG.model);

export default GEMINI_CONFIG;