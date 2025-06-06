import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const userId = localStorage.getItem('userId');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user", userId],
    enabled: !!userId,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!userId,
    userId,
  };
}