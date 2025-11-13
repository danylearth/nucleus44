import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Watch, 
  Smartphone, 
  Heart, 
  Activity, 
  Battery,
  Wifi,
  WifiOff,
  MoreVertical,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WearableDevice } from "@/entities/all";
import { format } from "date-fns";

export default function DeviceCard({ device, onUpdate }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'smartwatch': return Watch;
      case 'fitness_tracker': return Activity;
      case 'heart_rate_monitor': return Heart;
      case 'continuous_glucose_monitor': return Activity;
      case 'sleep_tracker': return Activity;
      default: return Smartphone;
    }
  };

  const getBrandColor = (brand) => {
    const colors = {
      apple: 'bg-gray-900',
      garmin: 'bg-blue-600',
      fitbit: 'bg-teal-600',
      oura: 'bg-black',
      whoop: 'bg-red-600',
      samsung: 'bg-blue-700',
      polar: 'bg-red-500'
    };
    return colors[brand.toLowerCase()] || 'bg-gray-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await WearableDevice.update(device.id, {
        connection_status: 'connected',
        last_sync: new Date().toISOString()
      });
      onUpdate();
    } catch (error) {
      console.error('Error connecting device:', error);
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    try {
      await WearableDevice.update(device.id, {
        connection_status: 'disconnected'
      });
      onUpdate();
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      try {
        await WearableDevice.delete(device.id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting device:', error);
      }
    }
  };

  const DeviceIcon = getDeviceIcon(device.device_type);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-3 ${getBrandColor(device.brand)} rounded-xl`}>
              <DeviceIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{device.device_name}</h3>
              <p className="text-sm text-gray-600 capitalize">
                {device.brand} • {device.device_type.replace('_', ' ')}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(device.connection_status)}>
                  {device.connection_status === 'connected' && <Wifi className="w-3 h-3 mr-1" />}
                  {device.connection_status === 'disconnected' && <WifiOff className="w-3 h-3 mr-1" />}
                  {device.connection_status}
                </Badge>
                {device.battery_level && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Battery className="w-3 h-3" />
                    {device.battery_level}%
                  </div>
                )}
              </div>
              {device.last_sync && (
                <p className="text-xs text-gray-500 mt-2">
                  Last sync: {format(new Date(device.last_sync), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {device.connection_status === 'connected' ? (
                <DropdownMenuItem onClick={handleDisconnect}>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnect
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleConnect} disabled={isConnecting}>
                  <Wifi className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}