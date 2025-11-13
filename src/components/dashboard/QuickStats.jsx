import { Card, CardContent } from "@/components/ui/card";
import { Heart, Moon, Zap, Activity } from "lucide-react";

export default function QuickStats() {
  const stats = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: "72 BPM",
      trend: "Normal",
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      icon: Moon,
      label: "Sleep Score",
      value: "8.2h",
      trend: "Good",
      color: "text-purple-500",
      bg: "bg-purple-50"
    },
    {
      icon: Zap,
      label: "Energy",
      value: "High",
      trend: "+5%",
      color: "text-yellow-500",
      bg: "bg-yellow-50"
    },
    {
      icon: Activity,
      label: "Steps",
      value: "8,543",
      trend: "85% Goal",
      color: "text-blue-500",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className={`p-2 ${stat.bg} rounded-full w-fit mb-3`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}