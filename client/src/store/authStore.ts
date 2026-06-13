import { create } from "zustand";

export type User = {
  id: string;
  name: string;
  email: string;
  username?: string;
  onboardingCompleted: boolean;
  avatarUrl?: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),
  logout: () => {
    
    set({ user: null, isAuthenticated: false });
  },
}));
