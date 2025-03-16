import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { insertCouponSchema, type Coupon } from "@shared/schema";
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
import { Gift } from "lucide-react";
import { PointsDisplay } from "@/components/ui/points/points-display";
import { Trash2 } from "lucide-react";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

export default function Coupons() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons"],
  });

  const form = useForm({
    resolver: zodResolver(insertCouponSchema),
    defaultValues: {
      title: "",
      description: "",
      points: 0,
      createdBy: CURRENT_PARTNER,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/coupons", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Coupon created",
        description: "New love coupon has been added.",
      });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/coupons/${id}/redeem`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points"] });
      toast({
        title: "Coupon redeemed!",
        description: "Time to claim your reward!",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/coupons/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points"] });
      toast({
        title: "Coupon deleted",
        description: "The coupon has been removed from your list.",
      });
    },
  });

  if (isLoading) {
    return <div>Loading coupons...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Love Coupons</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Love Coupon</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  createMutation.mutate(values)
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Full Body Massage" />
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
                        <Textarea
                          {...field}
                          placeholder="Add any special conditions or details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Cost</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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
                  Create Coupon
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <PointsDisplay />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons?.map((coupon) => (
          <Card
            key={coupon.id}
            className={cn(
              "relative overflow-hidden transition-colors",
              coupon.redeemed && "opacity-60"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">{coupon.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {coupon.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created by: {coupon.createdBy === CURRENT_PARTNER ? "You" : "Your Partner"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-primary">{coupon.points} points</span>
                    {coupon.redeemed && (
                      <span className="text-sm text-muted-foreground">
                        Redeemed on{" "}
                        {new Date(coupon.redeemedAt!).toLocaleDateString()}
                      </span>
                    )}
                    {coupon.redeemed ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={
                          coupon.redeemed ||
                          redeemMutation.isPending ||
                          coupon.createdBy === CURRENT_PARTNER
                        }
                        onClick={() => redeemMutation.mutate(coupon.id)}
                      >
                        <Gift
                          className={cn(
                            "h-5 w-5",
                            coupon.redeemed ? "text-muted-foreground" : "text-primary"
                          )}
                        />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}