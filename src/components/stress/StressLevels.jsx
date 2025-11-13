import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function StressLevels() {
  const levels = [
    { name: "Very Low", time: "2h 30m", range: "0-20", color: "bg-green-500" },
    { name: "Low", time: "18h 15m", range: "20-40", color: "bg-teal-500" },
    { name: "Moderate", time: "3h 10m", range: "40-60", color: "bg-yellow-500" },
    { name: "High", time: "5m", range: "60-80", color: "bg-orange-500" },
  ];

  const totalMinutes = levels.reduce((sum, level) => {
    const [hours, minutes] = level.time.split('h ');
    return sum + (parseInt(hours) * 60) + (minutes ? parseInt(minutes.replace('m', '')) : 0);
  }, 0);

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900">Stress Distribution</h3>
        </div>

        {/* Stress levels visualization */}
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
            {levels.map((level, index) => {
              const [hours, minutes] = level.time.split('h ');
              const levelMinutes = (parseInt(hours) * 60) + (minutes ? parseInt(minutes.replace('m', '')) : 0);
              const percentage = (levelMinutes / totalMinutes) * 100;
              
              return (
                <div
                  key={index}
                  className={`${level.color} transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {levels.map((level, index) => (
            <div key={index} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 ${level.color} rounded-full`}></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{level.name}</h4>
                  <p className="text-xs text-gray-500">HRV {level.range}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">{level.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}