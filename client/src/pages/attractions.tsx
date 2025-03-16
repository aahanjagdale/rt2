import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { insertAttractionSchema, type Attraction } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SparklesIcon } from "lucide-react";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

const attractionTypes = [
  { value: "physical", label: "Physical Attraction" },
  { value: "personality", label: "Personality Trait" },
  { value: "quirk", label: "Adorable Quirk" },
  { value: "talent", label: "Special Talent" },
  { value: "other", label: "Other" },
];

export default function Attractions() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: attractions, isLoading } = useQuery<Attraction[]>({ 
    queryKey: ['/api/attractions']
  });

  const form = useForm({
    resolver: zodResolver(insertAttractionSchema),
    defaultValues: {
      detail: "",
      type: "physical",
      createdBy: CURRENT_PARTNER,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest('POST', '/api/attractions', values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
      setOpen(false);
      form.reset();
      toast({
        title: "Attraction added",
        description: "Your partner will love to hear this!",
      });
    },
  });

  if (isLoading) {
    return <div>Loading attractions...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Why I Find You Hot</h2>
          <p className="text-muted-foreground mt-2">
            Share what makes your partner special and attractive to you.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Attraction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>What do you find attractive?</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Attraction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select what type of attraction this is" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {attractionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="detail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe what you find attractive..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  Share Attraction
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {attractions?.map((attraction) => (
          <Card key={attraction.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <SparklesIcon className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {attractionTypes.find(t => t.value === attraction.type)?.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {attraction.detail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Shared by: {attraction.createdBy === CURRENT_PARTNER ? "You" : "Your Partner"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
