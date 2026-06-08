export function isValidContactNumber(contactNumber: string): boolean {
  return /^\d{10}$/.test(contactNumber) && !/^0+$/.test(contactNumber);
}

export function isValidPersonalEmail(personalEmail: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail);
}