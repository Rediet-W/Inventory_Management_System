import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      userInfo: null, // ✅ Store user authentication info

      products: [],
      sales: [],
      purchases: [],

      // ✅ Set user info after login
      setUserInfo: (user) => set({ userInfo: user }),

      // ✅ Logout function
      logout: () => set({ userInfo: null }),

      fetchProducts: async () => {
        try {
          const token = useAuthStore.getState().userInfo?.token;

          if (!token) {
            console.error("❌ Unauthorized: No token available.");
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/products`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ Add token here
              },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch products");
          const data = await res.json();
          set({ products: data });
        } catch (error) {
          console.error("Failed to fetch products", error);
        }
      },

      fetchSales: async () => {
        try {
          const token = get().userInfo?.token;
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/sales`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ Add token here
              },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch sales");
          const data = await res.json();
          set({ sales: data });
        } catch (error) {
          console.error("Failed to fetch sales", error);
        }
      },

      fetchPurchases: async () => {
        try {
          const token = get().userInfo?.token;
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/purchases`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ Add token here
              },
            }
          );
          if (!res.ok) throw new Error("Failed to fetch purchases");
          const data = await res.json();
          set({ purchases: data });
        } catch (error) {
          console.error("Failed to fetch purchases", error);
        }
      },

      addProduct: async (productData) => {
        try {
          const token = useAuthStore.getState().userInfo?.token;

          if (!token) {
            console.error("❌ Unauthorized: No token available.");
            return;
          }

          console.log("Token:", token);
          if (!token) {
            console.error("Unauthorized: User not logged in.");
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/products`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(productData),
            }
          );

          if (!res.ok) throw new Error("Failed to add product");
          const product = await res.json();

          set((state) => ({
            products: [...state.products, product],
          }));
        } catch (error) {
          console.error("Failed to add product:", error);
        }
      },

      removeProduct: async (id) => {
        try {
          const token = get().userInfo?.token;
          if (!token) {
            console.error("Unauthorized: User not logged in.");
            return;
          }

          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // ✅ Add token here
              },
            }
          );

          if (!res.ok) throw new Error("Failed to remove product");

          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));
        } catch (error) {
          console.error("Failed to remove product:", error);
        }
      },
    }),
    {
      name: "inventory-store", // ✅ Persist state in localStorage
    }
  )
);
