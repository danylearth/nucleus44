import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthScoreCard({ score, trend }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return "from-green-50 to-emerald-50";
    if (score >= 60) return "from-yellow-50 to-amber-50";
    return "from-red-50 to-pink-50";
  };

  return (
    <Card className={`bg-gradient-to-br ${getScoreBackground(score)} border-0 shadow-lg overflow-hidden`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/60 rounded-full">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900">Health Score</h3>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-4">
          <motion.div
            
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            
            className="flex-1"
          >
            <div className={`text-5xl font-bold ${getScoreColor(score)} mb-2`}>
              {score}
            </div>
            <Progress 
              value={score} 
              className="h-2 bg-white/50"
            />
          </motion.div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">out of 100</p>
            <p className="text-xs text-gray-500 mt-1">
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs improvement'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}