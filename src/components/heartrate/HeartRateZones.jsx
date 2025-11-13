import { Card, CardContent } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";

export default function HeartRateZones() {
  const zones = [
    { name: "Resting", time: "8h 30m", range: "50-60 bpm", dotColor: "bg-cyan-400", bgColor: "bg-cyan-50/60" },
    { name: "Normal", time: "8h 30m", range: "60-100 bpm", dotColor: "bg-green-500", bgColor: "bg-green-50/60" },
    { name: "Moderate", time: "8h 30m", range: "100-140 bpm", dotColor: "bg-orange-400", bgColor: "bg-orange-50/60" },
    { name: "Intense", time: "8h 30m", range: "140-180 bpm", dotColor: "bg-red-500", bgColor: "bg-red-50/60" },
  ];

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse className="w-5 h-5 text-cyan-500" />
          <h3 className="font-semibold text-gray-900">Heart Rate Zones</h3>
        </div>
        <div className="space-y-2">
          {zones.map((zone) => (
            <div key={zone.name} className={`flex items-center justify-between p-3 rounded-xl ${zone.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 ${zone.dotColor} rounded-full`}></div>
                <h4 className="font-medium text-gray-800">{zone.name}</h4>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{zone.time}</p>
                <p className="text-xs text-gray-500">{zone.range}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}