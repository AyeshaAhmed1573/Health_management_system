// Thin adapter over the real session (AuthProvider). The previous version asked /auth/me with
// cookies, but this app authenticates with a Bearer token, so it always reported "logged out".
import { useAuth as useSessionAuth } from "@/lib/authContext";

export function useAuth() {
  const { user, loading, logout } = useSessionAuth();
  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    logout,
    isLoggingOut: false,
  };
}
