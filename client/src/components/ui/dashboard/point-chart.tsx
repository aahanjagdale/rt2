import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Point } from "@shared/schema";

interface PointChartProps {
  points: Point[];
}

export function PointChart({ points }: PointChartProps) {
  // Sort points by date and prepare data
  const data = points
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    })
    .map(point => ({
      date: point.createdAt ? new Date(point.createdAt).toLocaleDateString() : 'Unknown',
      points: point.amount,
      runningTotal: 0 // Will be calculated below
    }));

  // Calculate running total
  let total = 0;
  data.forEach(item => {
    total += item.points;
    item.runningTotal = total;
  });

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Points History</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="runningTotal"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: 4,
                }}
                name="Total Points"
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                name="Points Earned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}