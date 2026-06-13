export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  onboardingCompleted: boolean;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  onboardingCompleted: boolean;
}
