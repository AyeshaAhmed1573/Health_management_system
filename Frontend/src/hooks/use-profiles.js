import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useProfiles() {
  return useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      let res = await fetch("/api/patients", { credentials: "include" });
      if (!res.ok) {
        res = await fetch("/api/profiles", { credentials: "include" });
      }

      if (!res.ok) return [];

      const data = await res.json();
      const rawList = Array.isArray(data) ? data : data.patientProfiles || [];

      return rawList.map((p) => ({
        id: p._id || p.id,
        _id: p._id || p.id,
        name: p.name || "Patient Profile",
        relationship: p.relationship || "self",
        createdAt: p.createdAt,
        consentGiven: p.consent?.given,
      }));
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create profile");
      }

      const resData = await res.json();
      return resData.patientProfile || resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
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
