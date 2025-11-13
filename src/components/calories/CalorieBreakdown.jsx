import { Card, CardContent } from "@/components/ui/card";
import { Utensils } from "lucide-react";

export default function CalorieBreakdown() {
  const macros = [
    { name: "Protein", amount: "85g", percentage: 68, color: "#4ECDC4", strokeColor: "#B8F2EF" },
    { name: "Carbs", amount: "220g", percentage: 73, color: "#8B5CF6", strokeColor: "#C4B5FD" },
    { name: "Fats", amount: "65g", percentage: 81, color: "#F59E0B", strokeColor: "#FDE68A" },
  ];

  const CircularProgress = ({ percentage, color, strokeColor, amount, name }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-3">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={strokeColor}
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-800">{amount}</span>
          </div>
        </div>
        <h4 className="text-sm font-medium text-gray-800">{name}</h4>
      </div>
    );
  };

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900">Macronutrients</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {macros.map((macro, index) => (
            <CircularProgress
              key={index}
              percentage={macro.percentage}
              color={macro.color}
              strokeColor={macro.strokeColor}
              amount={macro.amount}
              name={macro.name}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}