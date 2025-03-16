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
import { insertBucketlistSchema, type Bucketlist } from "@shared/schema";
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
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

export default function Bucketlist() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<Bucketlist[]>({ 
    queryKey: ['/api/bucketlist']
  });

  const form = useForm({
    resolver: zodResolver(insertBucketlistSchema),
    defaultValues: {
      title: "",
      description: "",
      createdBy: CURRENT_PARTNER,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest('POST', '/api/bucketlist', values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bucketlist'] });
      setOpen(false);
      form.reset();
      toast({
        title: "Bucket list item added",
        description: "New dream added to your bucket list.",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/bucketlist/${id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bucketlist'] });
      toast({
        title: "Dream achieved!",
        description: "You've completed a bucket list item together!",
      });
    },
  });

  if (isLoading) {
    return <div>Loading bucket list...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Bucket List</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Dream</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Bucket List</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
                  Add to List
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {items?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Added by: {item.createdBy === CURRENT_PARTNER ? "You" : "Your Partner"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={item.completed || completeMutation.isPending}
                  onClick={() => completeMutation.mutate(item.id)}
                >
                  <CheckCircle className={
                    item.completed ? "text-primary fill-primary" : "text-muted-foreground"
                  } />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}