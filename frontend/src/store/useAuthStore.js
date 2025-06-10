import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (user) => {
        if (!user.token) {
          console.error("❌ Token is missing in userInfo:", user);
        } else {
        }
        set({ userInfo: user });
      },

      logout: () => set({ userInfo: null }),
    }),
    {
      name: "auth-store",
    }
  )
);
