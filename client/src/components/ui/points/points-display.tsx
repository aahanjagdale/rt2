import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

// Temporary until we add authentication
const CURRENT_PARTNER = "partner1";

export function PointsDisplay() {
  const { data: myPoints } = useQuery<{ total: number }>({
    queryKey: ['/api/points/total', { partner: CURRENT_PARTNER }]
  });

  const { data: partnerPoints } = useQuery<{ total: number }>({
    queryKey: ['/api/points/total', { partner: 'partner2' }]
  });

  return (
    <div className="grid gap-4 grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">My Points</p>
          <p className="text-2xl font-bold">{myPoints?.total || 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium">Partner's Points</p>
          <p className="text-2xl font-bold">{partnerPoints?.total || 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}