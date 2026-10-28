/**
 * Validation utilities for API requests
 */

// Chatbot validation functions (for existing chatbot system)
export function validateMessage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  if (message.trim().length === 0) {
    return false;
  }
  if (message.length > 10000) {
    return false;
  }
  return true;
}

export function trimHistory(history, maxMessages = 20) {
  if (!Array.isArray(history)) {
    return [];
  }
  if (history.length <= maxMessages) {
    return history;
  }
  // Keep the most recent messages
  return history.slice(-maxMessages);
}

// Vendor marketplace validation functions
export function validateVendorRegistration(data) {
  const errors = [];

  // Validate vendor data
  if (!data.businessName || data.businessName.trim().length < 2) {
    errors.push('Business name must be at least 2 characters');
  }

  if (!data.type || !['pharmacy', 'laboratory'].includes(data.type)) {
    errors.push('Vendor type must be either pharmacy or laboratory');
  }

  if (!data.licenseNumber || data.licenseNumber.trim().length < 5) {
    errors.push('License number is required and must be at least 5 characters');
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!data.address || !data.address.street || !data.address.city) {
    errors.push('Complete address is required (street and city)');
  }

  if (!data.contactInfo || !data.contactInfo.phone) {
    errors.push('Contact phone number is required');
  }

  // Validate owner data
  if (!data.ownerData) {
    errors.push('Owner information is required');
  } else {
    if (!data.ownerData.name || data.ownerData.name.trim().length < 2) {
      errors.push('Owner name must be at least 2 characters');
    }

    if (!data.ownerData.email || !isValidEmail(data.ownerData.email)) {
      errors.push('Valid email address is required');
    }

    if (!data.ownerData.password || data.ownerData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!data.ownerData.phone || data.ownerData.phone.trim().length < 10) {
      errors.push('Valid phone number is required');
    }
  }

  return errors;
}

export function validateProductData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters');
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.push('Category is required');
  }

  if (!data.price || data.price < 0) {
    errors.push('Valid price is required');
  }

  if (data.stock === undefined || data.stock < 0) {
    errors.push('Valid stock quantity is required');
  }

  return errors;
}

export function validateLabTestData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Test name must be at least 2 characters');
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.push('Category is required');
  }

  if (!data.sampleType || !['blood', 'urine', 'stool', 'swab', 'tissue', 'saliva', 'other'].includes(data.sampleType)) {
    errors.push('Valid sample type is required');
  }

  if (!data.turnaroundHours || data.turnaroundHours < 0) {
    errors.push('Valid turnaround time is required');
  }

  if (!data.price || data.price < 0) {
    errors.push('Valid price is required');
  }

  return errors;
}

export function validateOrderData(data) {
  const errors = [];

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  if (!data.deliveryAddress || !data.deliveryAddress.street || !data.deliveryAddress.city) {
    errors.push('Complete delivery address is required');
  }

  return errors;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatValidationErrors(errors) {
  return errors.join(', ');
}
