import { create } from "zustand";
import axios from "axios";
import { IUser } from "@/types";

interface AuthState {
  user: Omit<IUser, "password"> | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  
  // Actions
  checkSession: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; profilePicture?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  clearError: () => set({ error: null }),

  checkSession: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get("/api/auth/me");
      if (response.data.success && response.data.user) {
        set({ user: response.data.user, initialized: true, loading: false });
      } else {
        set({ user: null, initialized: true, loading: false });
      }
    } catch {
      set({ user: null, initialized: true, loading: false });
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/auth/login", credentials);
      if (response.data.success && response.data.user) {
        set({ user: response.data.user, loading: false });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Login failed. Please check credentials.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post("/api/auth/register", data);
      if (response.data.success && response.data.user) {
        set({ user: response.data.user, loading: false });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Registration failed. Email might already exist.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axios.post("/api/auth/logout");
      set({ user: null, loading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Logout failed.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put("/api/auth/me", data);
      if (response.data.success && response.data.user) {
        set({ user: response.data.user, loading: false });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Profile update failed.";
      set({ error: errMsg, loading: false });
      throw new Error(errMsg);
    }
  },
}));
