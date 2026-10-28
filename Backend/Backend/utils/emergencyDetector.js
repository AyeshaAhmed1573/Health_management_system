const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cardiac arrest',
  "can't breathe", 'cannot breathe', 'difficulty breathing',
  'stroke', 'unconscious', 'passed out', 'not responding',
  'severe bleeding', 'overdose', 'poisoning', 'seizure',
  'convulsion', 'suicide', 'kill myself', 'anaphylaxis',
  "throat closing",
];

export const isEmergency = (text) => {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
};

export const getEmergencyNotice = () =>
  `🚨 EMERGENCY ALERT 🚨\n\n` +
  `This sounds like a medical emergency. Call immediately:\n` +
  `• Rescue: 1122\n• Edhi Foundation: 115\n• Chippa: 1020\n\n` +
  `General guidance while help arrives:\n`;