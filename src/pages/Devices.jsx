import { useState, useEffect } from "react";
import { TerraConnection, User } from "@/entities/all"; // Changed from WearableDevice
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Watch,
  Plus,
  ChevronLeft,
  Bell,
  ChevronRight,
  Heart,
  Smartphone,
  Repeat,
  RefreshCw // Added RefreshCw import
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import AddDeviceDialog from "../components/devices/AddDeviceDialog";
import { forceSync } from "@/functions/forceSync"; // Import the new function

// Helper to get details for each Terra provider
const getProviderDetails = (provider) => {
  switch (provider) {
    // case 'APPLE_HEALTH':
    //     return { name: "Apple Health", icon: <Heart className="w-6 h-6 text-red-500" />, bgColor: "bg-red-50", subtitle: "Steps, health record, vitals" };
    case 'GOOGLE_FIT':
      return { name: "Google Fit", icon: <Smartphone className="w-6 h-6 text-blue-500" />, bgColor: "bg-blue-50", subtitle: "Activity, sleep, heart rate" };
    case 'GARMIN':
      return { name: "Garmin", icon: <Watch className="w-6 h-6 text-gray-800" />, bgColor: "bg-gray-100", subtitle: "Heart rate, activity, sleep" };
    case 'FITBIT':
      return { name: "Fitbit", icon: <Watch className="w-6 h-6 text-pink-500" />, bgColor: "bg-pink-50", subtitle: "Activity, sleep, heart rate" };
    case 'OURA':
      return { name: "Oura Ring", icon: <Repeat className="w-6 h-6 text-indigo-500" />, bgColor: "bg-indigo-50", subtitle: "Sleep, readiness, activity" };
    default:
      return { name: provider, icon: <Watch className="w-6 h-6 text-gray-800" />, bgColor: "bg-gray-100", subtitle: "General health data" };
  }
}

export default function DevicesPage() {
  const [connections, setConnections] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(null); // To track which connection is syncing

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      const user = await User.me().catch(() => ({ id: '' })); // FIX: Default to empty id
      if (user.id) { // FIX: Check for id
        // Fetch real connections from TerraConnection entity
        const userConnections = await TerraConnection.filter({ user_id: user.id }); // FIX: Filter by id
        setConnections(userConnections.sort((a, b) => new Date(b.connected_at) - new Date(a.connected_at)));
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async (connectionId) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    setIsSyncing(connectionId);
    try {
      const user = await User.me();
      if (!user?.id) return; // FIX: Add check for user.id
      const response = await forceSync({ user_id: user.id }); // FIX: Use id instead of email
      alert(response.data.message || 'Sync successful!');
      // Refresh connections to show updated last_sync time
      loadConnections();
    } catch (error) {
      console.error('Manual sync failed:', error);
      alert('Manual sync failed. Please try again.');
    } finally {
      setIsSyncing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 pt-12 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-20 bg-gray-200 rounded-2xl"></div>
        <div className="h-20 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Profile")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Connected Sources</h1>
        <div className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="px-4">
        <p className="text-gray-600 text-sm mb-6">
          Manage your connected health data sources. Connections are made via the mobile app.
        </p>

        <div className="space-y-4">
          {connections.filter(conn => conn.provider !== 'APPLE_HEALTH').map((conn) => {
            const details = getProviderDetails(conn.provider);
            const isCurrentlySyncing = isSyncing === conn.id;
            return (
              <Card key={conn.id} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${details.bgColor} rounded-full flex items-center justify-center`}>
                      {details.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{details.name}</h3>
                      <p className="text-sm text-gray-500">
                        {conn.is_active ? "Connected" : "Disconnected"} • Last sync: {conn.last_sync ? new Date(conn.last_sync).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); handleManualSync(conn.id); }} // Prevent card click if the card itself were clickable
                    disabled={isCurrentlySyncing}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    {isCurrentlySyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {/* Add New Device Button */}
          <button
            onClick={() => setShowAddDialog(true)}
            className="w-full text-left"
          >
            <Card className="bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-600">Add New Source</h3>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </button>
        </div>
      </div>

      {/* Add Device Dialog - Now instructional */}
      <AddDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onDeviceConnected={loadConnections}
      />
    </div>
  );
}