import { Card, CardContent } from "@/components/ui/card";
import { Droplets } from "lucide-react";

export default function WaterIntakeLog() {
  const todaysIntake = [
    { time: '7:00 AM', amount: '250ml', type: 'Glass of water' },
    { time: '9:30 AM', amount: '500ml', type: 'Water bottle' },
    { time: '12:00 PM', amount: '250ml', type: 'With lunch' },
    { time: '2:30 PM', amount: '250ml', type: 'Afternoon hydration' },
    { time: '4:00 PM', amount: '250ml', type: 'Pre-workout' },
  ];

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Today's Log</h3>
        </div>

        <div className="space-y-3">
          {todaysIntake.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-gray-900">{entry.type}</h4>
                  <p className="text-xs text-gray-500">{entry.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">{entry.amount}</p>
              </div>
            </div>
          ))}
        </div>

        {todaysIntake.length === 0 && (
          <div className="text-center py-6">
            <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No water logged today</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}