import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Users, Plus, UserCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfiles, useCreateProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@/lib/api";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Profiles() {
  const { data, isLoading } = useProfiles();
  const createMutation = useCreateProfile();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      name: "",
      relationship: "self",
      userId: user?.id || "temp-id",
    },
  });

  const onSubmit = (values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Family Profiles"
        description="Manage health records for yourself and your dependents."
        icon={Users}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-display font-semibold">Active Profiles</h2>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-gradient rounded-xl">
                <Plus className="w-5 h-5 mr-1" /> Add Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Profile</DialogTitle>
                <DialogDescription>
                  Add a family member to manage their health records centrally.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Jane Doe" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relationship</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="self">Self</SelectItem>
                            <SelectItem value="spouse">Spouse</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full btn-primary-gradient rounded-xl py-6 mt-4"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Save Profile"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((profile) => (
              <div key={profile.id} className="medical-card p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4 border-4 border-card shadow-sm">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display mb-1">{profile.name}</h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                  {profile.relationship}
                </span>

                <div className="text-sm text-muted-foreground mt-auto pt-4 w-full border-t border-border/50">
                  Added: {profile.createdAt ? format(new Date(profile.createdAt), "MMM d, yyyy") : "Unknown"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border p-12 rounded-3xl text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't added any family profiles yet. Create your first profile to start managing health records.
            </p>
            <Button onClick={() => setOpen(true)} className="btn-primary-gradient rounded-xl">
              Create First Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
