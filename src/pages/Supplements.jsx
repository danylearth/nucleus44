import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Bell, 
  Plus, 
  Sun, 
  Sunset, 
  Moon,
  Pill,
  Check
} from "lucide-react";
import { format } from "date-fns";

import { Supplement } from "@/entities/Supplement";
import AddSupplementDialog from "../components/supplements/AddSupplementDialog";

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadSupplements();
  }, []);

  const loadSupplements = async () => {
    setIsLoading(true);
    try {
      const allSupplements = await Supplement.list();
      setSupplements(allSupplements);
    } catch (error) {
      console.error("Error loading supplements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaken = async (supplement) => {
    const isTaken = supplement.taken_dates?.includes(today);
    let updatedTakenDates = supplement.taken_dates || [];

    if (isTaken) {
      updatedTakenDates = updatedTakenDates.filter(date => date !== today);
    } else {
      updatedTakenDates.push(today);
    }

    try {
      await Supplement.update(supplement.id, { taken_dates: updatedTakenDates });
      loadSupplements(); // Refresh the list
    } catch (error) {
      console.error("Error updating supplement:", error);
    }
  };

  const renderSupplementList = (timeOfDay, icon) => {
    const IconComponent = icon;
    const filteredSupplements = supplements.filter(s => s.time_of_day === timeOfDay);

    if (filteredSupplements.length === 0) return null;

    return (
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
          <IconComponent className="w-5 h-5 text-yellow-500" />
          {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
        </h2>
        <div className="space-y-3">
          {filteredSupplements.map(sup => (
            <Card key={sup.id} className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sup.taken_dates?.includes(today) ? 'bg-teal-500' : 'bg-gray-100'}`}>
                    {sup.taken_dates?.includes(today) ? <Check className="w-6 h-6 text-white" /> : <Pill className="w-6 h-6 text-gray-500" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{sup.name}</h3>
                    <p className="text-sm text-gray-500">{sup.dosage}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => handleToggleTaken(sup)}>
                  {sup.taken_dates?.includes(today) ? "Mark as Not Taken" : "Mark as Taken"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  const takenCount = supplements.filter(s => s.taken_dates?.includes(today)).length;
  const totalCount = supplements.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  if (isLoading) {
    return <div className="p-4 pt-12">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Supplements</h1>
        <div className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="px-4 space-y-6 pb-24">
        {/* Today's Progress */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Today's Plan</h2>
              <span className="text-sm font-medium text-teal-600">{takenCount}/{totalCount} Taken</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Supplement Lists */}
        {renderSupplementList("morning", Sun)}
        {renderSupplementList("afternoon", Sunset)}
        {renderSupplementList("evening", Moon)}
        
        {/* My Cabinet / Add Button */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
             <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                My Cabinet
             </h2>
             <p className="text-sm text-gray-500 mb-4">Manage your full list of supplements.</p>
             <Button onClick={() => setShowAddDialog(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New Supplement
             </Button>
          </CardContent>
        </Card>
      </div>
      
      <AddSupplementDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSupplementAdded={loadSupplements}
      />
    </div>
  );
}