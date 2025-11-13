import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pill, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SupplementsCard() {
  const [supplements, setSupplements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSupplements();
  }, []);

  const loadSupplements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allSupplements = await base44.entities.Supplement.list();
      setSupplements(allSupplements || []);
    } catch (error) {
      console.error("Error loading supplements:", error);
      setError(error.message);
      setSupplements([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Count how many supplements were taken today
  const takenCount = supplements.filter(sup => sup.taken_dates?.includes(today)).length;
  const totalCount = supplements.length;

  // Calculate streak (consecutive days with all supplements taken)
  const calculateStreak = () => {
    if (supplements.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if ALL supplements were taken on this date
      const allTaken = supplements.every(sup => sup.taken_dates?.includes(dateStr));
      
      if (!allTaken) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Limit to reasonable check (e.g., 365 days)
      if (streak > 365) break;
    }
    
    return streak;
  };

  const streak = calculateStreak();

  if (isLoading) {
    return (
      <Card className="bg-white rounded-2xl border-0 subtle-shadow animate-pulse">
        <CardContent className="p-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there was an error, show "no supplements" state (fail gracefully)
  if (error || supplements.length === 0) {
    return (
      <Link to={createPageUrl("Supplements")}>
        <Card className="bg-white rounded-2xl border-0 subtle-shadow hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Track Your Supplements</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add your daily supplements and track your consistency
            </p>
            <div className="inline-flex items-center gap-2 text-teal-600 font-medium text-sm">
              <Plus className="w-4 h-4" />
              Add Supplements
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={createPageUrl("Supplements")}>
      <Card className="bg-white rounded-2xl border-0 subtle-shadow hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-500" />
              <span className="text-base font-medium text-gray-900">Supplements</span>
            </div>
            {streak > 0 && (
              <Badge className="bg-teal-50 text-teal-600 text-xs border-teal-200">
                {streak} day streak
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-3xl font-bold text-gray-900">{takenCount}/{totalCount}</span>
              <span className="text-gray-500 text-sm font-medium">taken today</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {supplements.slice(0, 5).map((supplement, index) => {
              const isTaken = supplement.taken_dates?.includes(today);
              return (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs px-3 py-1 font-medium ${
                    isTaken
                      ? 'bg-[#EDE1F7] text-purple-700 border-[#DCC3EF]'
                      : 'bg-white text-gray-600 border-[#D4D5D6]'
                  }`}
                >
                  {supplement.name}
                </Badge>
              );
            })}
            {supplements.length > 5 && (
              <Badge variant="outline" className="text-xs px-3 py-1 font-medium bg-gray-50 text-gray-600 border-gray-200">
                +{supplements.length - 5} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}