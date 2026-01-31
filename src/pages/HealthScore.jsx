import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { 
  ChevronLeft, 
  Bell, 
  TrendingUp,
  Activity
} from "lucide-react";

export default function HealthScorePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const healthScore = user?.health_score || 0;

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between p-4 pt-12">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Health Score</h1>
          <div className="p-2 -mr-2">
            <Bell className="w-6 h-6 text-gray-400" />
          </div>
        </div>
        <div className="px-4 space-y-6 pb-24 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Health Score</h1>
        <div className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="px-4 space-y-6 pb-24">
        {/* Current Score Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl border-0 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-6xl font-bold mb-2">{healthScore}</div>
            <p className="text-white/80 mb-4">Your Health Score</p>
            <p className="text-sm text-white/70">
              Track your health metrics to see detailed insights
            </p>
          </CardContent>
        </Card>

        {/* Coming Soon Section */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Insights Coming Soon</h3>
            <p className="text-gray-500 text-sm">
              Connect your wearable devices and track your health data to unlock personalized score breakdowns and recommendations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}