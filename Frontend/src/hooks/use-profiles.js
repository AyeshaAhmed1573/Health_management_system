import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useProfiles() {
  return useQuery({
    queryKey: [api.profiles.list.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return api.profiles.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(api.profiles.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (res.status === 401) throw new Error("Unauthorized. Please log in.");
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.profiles.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create profile");
      }
      return api.profiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
      toast({
        title: "Success",
        description: "Profile created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
