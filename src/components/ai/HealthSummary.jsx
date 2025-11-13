import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Moon } from "lucide-react";

export default function HealthSummary({ user }) {
  const healthScore = user?.health_score || 85;
  
  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const status = getScoreStatus(healthScore);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="font-medium text-gray-900">Current Health Status</span>
          </div>
          <Badge className={status.color}>
            {status.label}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{healthScore}</p>
            <p className="text-sm text-gray-600">Health Score</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-white/50 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="p-2 bg-white/50 rounded-lg">
              <Moon className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Sleep</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}