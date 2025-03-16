import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Truth, Dare, insertTruthSchema, insertDareSchema } from "@shared/schema";
import { shuffle } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type GameMode = "truth" | "dare";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

export function GameCard() {
  const [mode, setMode] = useState<GameMode>("truth");
  const [intensity, setIntensity] = useState([3]);
  const [currentItem, setCurrentItem] = useState<Truth | Dare | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { toast } = useToast();

  const { data: truths } = useQuery<Truth[]>({
    queryKey: ['/api/game/truths', intensity[0]],
    enabled: mode === "truth",
  });

  const { data: dares } = useQuery<Dare[]>({
    queryKey: ['/api/game/dares', intensity[0]],
    enabled: mode === "dare",
  });

  const { data: points } = useQuery({
    queryKey: ['/api/points/total', CURRENT_PARTNER],
  });

  const form = useForm({
    resolver: zodResolver(mode === "truth" ? insertTruthSchema : insertDareSchema),
    defaultValues: {
      intensity: intensity[0],
      createdBy: CURRENT_PARTNER,
      cost: mode === "truth" ? 5 : 10,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const endpoint = mode === "truth" ? '/api/game/truths' : '/api/game/dares';
      const res = await apiRequest('POST', endpoint, values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [mode === "truth" ? '/api/game/truths' : '/api/game/dares'] });
      setCreateOpen(false);
      form.reset();
      toast({
        title: "Challenge created",
        description: `New ${mode} challenge has been added to the game.`,
      });
    },
  });

  const spendPointsMutation = useMutation({
    mutationFn: async (cost: number) => {
      await apiRequest('POST', '/api/points', {
        amount: -cost,
        reason: `Spent on ${mode}`,
        partner: CURRENT_PARTNER,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/points'] });
    },
  });

  const items = mode === "truth" ? truths : dares;

  const getRandomItem = () => {
    if (!items?.length) return;

    const availableItems = items.filter(item => {
      const cost = mode === "truth" ? item.cost : item.cost;
      return (points?.total || 0) >= cost;
    });

    if (!availableItems.length) {
      toast({
        title: "Not enough points",
        description: "Complete more tasks to earn points!",
        variant: "destructive",
      });
      return;
    }

    const item = shuffle(availableItems)[0];
    spendPointsMutation.mutate(item.cost);
    setCurrentItem(item);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Truth or Dare</CardTitle>
        <p className="text-center text-muted-foreground">
          Your Points: {points?.total || 0}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 justify-center">
          <Button
            variant={mode === "truth" ? "default" : "outline"}
            onClick={() => setMode("truth")}
          >
            Truth (Cost: 5-20)
          </Button>
          <Button
            variant={mode === "dare" ? "default" : "outline"}
            onClick={() => setMode("dare")}
          >
            Dare (Cost: 10-30)
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Intensity Level: {intensity[0]}</label>
          <Slider
            value={intensity}
            onValueChange={setIntensity}
            min={1}
            max={5}
            step={1}
          />
        </div>

        {currentItem && (
          <Card className="bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Created by: {currentItem.createdBy === CURRENT_PARTNER ? "You" : "Your Partner"}
              </p>
              <p className="text-lg">
                {mode === "truth"
                  ? (currentItem as Truth).question
                  : (currentItem as Dare).challenge}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Cost: {currentItem.cost} points
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            className="flex-1"
            size="lg"
            onClick={getRandomItem}
            disabled={spendPointsMutation.isPending}
          >
            Generate {mode === "truth" ? "Question" : "Challenge"}
          </Button>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Create New</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New {mode === "truth" ? "Truth Question" : "Dare Challenge"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name={mode === "truth" ? "question" : "challenge"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{mode === "truth" ? "Question" : "Challenge"}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="intensity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intensity Level (1-5)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost (Points)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={mode === "truth" ? 5 : 10}
                            max={mode === "truth" ? 20 : 30}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    Create Challenge
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}