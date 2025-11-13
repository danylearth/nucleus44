import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Utensils } from 'lucide-react';

const MacroCircle = ({ label, value, color, maxValue }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-full h-full" viewBox="0 0 44 44">
          <circle
            className="text-gray-200"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
          />
          <circle
            className={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="20"
            cx="22"
            cy="22"
            transform="rotate(-90 22 22)"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
          {Math.round(value)}g
        </span>
      </div>
      <span className="text-xs font-medium text-gray-500">{label}</span>
    </div>
  );
};

export default function NutritionCard({ nutritionData }) {
  if (!nutritionData) {
    return (
        <Link to={createPageUrl("Nutrition")}>
            <Card className="bg-white rounded-2xl border-0 subtle-shadow hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                    <Utensils className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <h3 className="font-semibold text-gray-800">Nutrition</h3>
                    <p className="text-sm text-gray-500">No nutrition data for today yet.</p>
                </CardContent>
            </Card>
        </Link>
    );
  }

  const { macros } = nutritionData;

  return (
    <Link to={createPageUrl("Nutrition")}>
      <Card className="bg-white rounded-2xl border-0 subtle-shadow hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-green-500" />
            <span className="text-base font-medium text-gray-900">Nutrition</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-gray-900">{Math.round(macros.calories)}</span>
              <span className="text-sm text-gray-500">Calories</span>
            </div>
            <div className="flex gap-4">
              <MacroCircle label="Protein" value={macros.protein_g || 0} color="text-sky-500" maxValue={150} />
              <MacroCircle label="Carbs" value={macros.carbohydrates_g || 0} color="text-orange-500" maxValue={300} />
              <MacroCircle label="Fat" value={macros.fat_g || 0} color="text-yellow-500" maxValue={70} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}