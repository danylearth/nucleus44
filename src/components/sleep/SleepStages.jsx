import { Card, CardContent } from "@/components/ui/card";
import { Moon } from "lucide-react";

export default function SleepStages() {
  const stages = [
    { name: "Awake", time: "8m", percentage: 2, color: "bg-yellow-500" },
    { name: "Light Sleep", time: "4h 12m", percentage: 70, color: "bg-blue-400" },
    { name: "Deep Sleep", time: "1h 22m", percentage: 23, color: "bg-purple-600" },
    { name: "REM Sleep", time: "18m", percentage: 5, color: "bg-indigo-500" },
  ];

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Sleep Stages</h3>
        </div>

        {/* Sleep stages visualization */}
        <div className="mb-4">
          <div className="h-8 bg-gray-200 rounded-full overflow-hidden flex">
            {stages.map((stage, index) => (
              <div
                key={index}
                className={`${stage.color} transition-all duration-300`}
                style={{ width: `${stage.percentage}%` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 ${stage.color} rounded-full`}></div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{stage.name}</h4>
                  <p className="text-xs text-gray-500">{stage.percentage}%</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">{stage.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}