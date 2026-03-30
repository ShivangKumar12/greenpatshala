// client/src/lib/validation.ts
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validators = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^[6-9]\d{9}$/,
    message: 'Please enter a valid 10-digit mobile number',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'Please enter a valid URL',
  },
  required: {
    required: true,
    message: 'This field is required',
  },
};

export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return rules.message || 'This field is required';
  }

  if (!value) return null; // Skip other validations if not required and empty

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return rules.message || `Minimum value is ${rules.min}`;
    }

    if (rules.max !== undefined && value > rules.max) {
      return rules.message || `Maximum value is ${rules.max}`;
    }
  }

  if (rules.custom && !rules.custom(value)) {
    return rules.message || 'Validation failed';
  }

  return null;
}

export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationErrors {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const error = validateField(data[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) {
    return { score, label: 'Weak', color: 'bg-red-500' };
  } else if (score <= 4) {
    return { score, label: 'Medium', color: 'bg-yellow-500' };
  } else {
    return { score, label: 'Strong', color: 'bg-green-500' };
  }
}
