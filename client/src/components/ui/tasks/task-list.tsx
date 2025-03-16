import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

export function TaskList() {
  const { toast } = useToast();
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest("POST", `/api/tasks/${taskId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points"] });
      toast({
        title: "Task completed!",
        description: "Points have been added to your total.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest("DELETE", `/api/tasks/${taskId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/points/total"] });
      toast({
        title: "Task deleted",
        description: "The task has been removed from your list.",
      });
    },
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  const myTasks = tasks?.filter((task) => task.assignedTo === CURRENT_PARTNER);
  const othersTasks = tasks?.filter((task) => task.assignedTo !== CURRENT_PARTNER);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tasks For Me</h3>
        {myTasks?.length === 0 && (
          <p className="text-muted-foreground">No tasks assigned to you yet.</p>
        )}
        {myTasks?.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="text-primary">+{task.points} points</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={task.completed || completeMutation.isPending}
                      onClick={() => completeMutation.mutate(task.id)}
                    >
                      <CheckCircle
                        className={cn(
                          "h-5 w-5",
                          task.completed
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tasks I Created</h3>
        {othersTasks?.length === 0 && (
          <p className="text-muted-foreground">You haven't created any tasks yet.</p>
        )}
        {othersTasks?.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="text-primary">+{task.points} points</span>
                    <span className="text-muted-foreground ml-2">
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={task.completed || completeMutation.isPending}
                      onClick={() => completeMutation.mutate(task.id)}
                    >
                      <CheckCircle
                        className={cn(
                          "h-5 w-5",
                          task.completed
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}