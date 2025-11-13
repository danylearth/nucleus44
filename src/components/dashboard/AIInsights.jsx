import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, ChevronRight, AlertCircle, TrendingUp, Target } from "lucide-react";

export default function AIInsights({ insights }) {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'alert': return AlertCircle;
      case 'trend': return TrendingUp;
      case 'goal_progress': return Target;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Connect your devices and take tests to get personalized insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 3).map((insight) => {
          const Icon = getInsightIcon(insight.insight_type);
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="p-2 bg-purple-100 rounded-full mt-0.5">
                <Icon className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {insight.title}
                  </h4>
                  <Badge className={`${getPriorityColor(insight.priority)} text-xs`}>
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {insight.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {insight.category}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}