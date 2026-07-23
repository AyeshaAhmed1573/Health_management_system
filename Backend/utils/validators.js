export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required and must be a string.' };
  }
  
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }
  
  if (trimmed.length > 5000) {
    return { valid: false, error: 'Message is too long. Maximum 5000 characters.' };
  }
  
  return { valid: true, trimmed };
};

export const trimHistory = (messages) => {
  const MAX_HISTORY = 10;
  if (messages.length <= MAX_HISTORY) return messages;
  
  // Keep the most recent messages, always include the last user message
  return messages.slice(-MAX_HISTORY);
};