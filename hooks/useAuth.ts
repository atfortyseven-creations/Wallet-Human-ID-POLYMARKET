import { useUser } from '@clerk/nextjs';

export function useAuth() {
  const { user, isLoaded } = useUser();
  
  return {
    isAuthenticated: isLoaded && !!user,
    user,
    isLoading: !isLoaded,
  };
}
