import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  tenant: null,
  accessToken: localStorage.getItem('accessToken') || null,
  setAuth: ({ user, tenant, accessToken }) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    set({ user, tenant, accessToken });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, tenant: null, accessToken: null });
  },
}));