// src/store/authStore.js
import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

const useAuthStore = create((set, get) => ({
  // Estado
  user: null,
  userProfile: null,
  loading: true,
  error: null,

  // Funciones
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Leer perfil del usuario (trigger ya lo creó)
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('🔴 [signIn] error fetching profile:', profileError);
          // Opcional: set error en estado
          set({ user: data.user, userProfile: null, loading: false, error: profileError.message });
          return { success: false, error: profileError.message };
        }

        set({ 
          user: data.user, 
          userProfile: profile, 
          loading: false,
          error: null 
        });
      }

      return { success: true };
    } catch (error) {
      console.error('💥 [signIn] CATCH error object:', error);
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  signUp: async (email, password, nombre, rol = 'operador') => {
    try {
      set({ loading: true, error: null });

      // Registro en Auth con logging detallado
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      console.log('🟢 [signUp] data:', data, 'error:', signUpError);
      if (signUpError) throw signUpError;

      // Leer el perfil que creó el trigger
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('🔴 [signUp] error fetching profile:', profileError);
          throw profileError;
        }

        set({
          user: data.user,
          userProfile: profile,
          loading: false,
          error: null
        });
      }

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error('💥 [signUp] CATCH error object:', error);
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      set({ user: null, userProfile: null, loading: false, error: null });
    } catch (error) {
      console.error('💥 [signOut] error:', error);
      set({ loading: false, error: error.message });
    }
  },

  initializeAuth: async () => {
    try {
      set({ loading: true });

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          set({ user: session.user, userProfile: profile, loading: false });
        } else {
          set({ user: session.user, userProfile: null, loading: false });
        }
      } else {
        set({ user: null, userProfile: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, userProfile: null, loading: false, error: error.message });
    }
  },

  clearError: () => set({ error: null }),

  // Getters
  isAuthenticated: () => {
    const state = get();
    return !!state.user;
  },

  isAdmin: () => {
    const state = get();
    return state.userProfile?.rol === 'administrador';
  },

  getUserRole: () => {
    const state = get();
    return state.userProfile?.rol || null;
  }
}));

export { useAuthStore };
export default useAuthStore;
