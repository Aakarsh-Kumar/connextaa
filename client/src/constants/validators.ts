import { SuccessResponse } from "@/types";

export function isValidContactNumber(contactNumber: string): boolean {
  return /^\d{10}$/.test(contactNumber) && !/^0+$/.test(contactNumber);
}

export function isValidPersonalEmail(personalEmail: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail);
}

export function isValidUsername(username: string): SuccessResponse {
  username = username.trim();

  if (!username) {
    return {
      success: false,
      message: "Username is required",
    };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  if (!usernameRegex.test(username)) {
    return {
      success: false,
      message:
        "Username can only contain letters, numbers and underscores.",
    };
  }

  if (username.length < 3 || username.length > 30) {
    return {
      success: false,
      message: "Username must be between 3 and 30 characters.",
    };
  }

  return {
    success: true,
    message: "",
  };
}