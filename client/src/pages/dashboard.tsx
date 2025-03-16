import { useQuery } from "@tanstack/react-query";
import { Heart, Trophy, Star } from "lucide-react";
import { StatsCard } from "@/components/ui/dashboard/stats-card";
import { PointChart } from "@/components/ui/dashboard/point-chart";
import { Point, Task } from "@shared/schema";
import { PointsDisplay } from "@/components/ui/points/points-display";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

export default function Dashboard() {
  const { data: points } = useQuery<Point[]>({ 
    queryKey: ['/api/points', { partner: CURRENT_PARTNER }]
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks']
  });

  const { data: totalPoints } = useQuery<{ total: number }>({
    queryKey: ['/api/points/total', { partner: CURRENT_PARTNER }]
  });

  const completedTasks = tasks?.filter(t => t.completed).length || 0;

  // Calculate streak based on consecutive days with completed tasks
  const calculateStreak = () => {
    if (!points?.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = points
      .filter(p => p.createdAt)
      .map(p => new Date(p.createdAt))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let currentDate = today;

    while (true) {
      const hasActivity = sortedDates.some(date => {
        const pointDate = new Date(date);
        pointDate.setHours(0, 0, 0, 0);
        return pointDate.getTime() === currentDate.getTime();
      });

      if (!hasActivity) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const streakDays = calculateStreak();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Points"
          value={totalPoints?.total || 0}
          icon={Trophy}
          description="Keep earning points together!"
        />
        <StatsCard
          title="Tasks Completed"
          value={completedTasks}
          icon={Star}
          description="Great teamwork!"
        />
        <StatsCard
          title="Day Streak"
          value={streakDays}
          icon={Heart}
          description="Days of continuous love"
        />
      </div>

      <PointsDisplay />

      <PointChart points={points || []} />
    </div>
  );
}