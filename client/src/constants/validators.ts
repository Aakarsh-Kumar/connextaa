interface ValidationResult {
  success: boolean;
  message: string;
}

export function isValidContactNumber(contactNumber: string): boolean {
  return /^\d{10}$/.test(contactNumber) && !/^0+$/.test(contactNumber);
}

export function isValidPersonalEmail(personalEmail: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail);
}

export async function isValidUsername(username: string): Promise<ValidationResult> {
  if (username) {
    username = username.trim();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
      return {
        success: false,
        message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores',
      };
    }
  }
  return {
    success: true,
    message: 'Username is valid',
  };
}

