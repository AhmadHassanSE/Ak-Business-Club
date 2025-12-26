import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type LoginInput = z.infer<typeof api.auth.login.input>;

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.user.path],
    queryFn: async () => {
      const res = await fetch(api.auth.user.path);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.user.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.user.path], data);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.user.path], null);
      toast({ title: "Logged out", description: "See you next time!" });
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
