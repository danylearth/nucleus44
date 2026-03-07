import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Smartphone, Loader2, Watch, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { callFunction } from '@/functions/_shared';

export default function AddDeviceDialog({ open, onOpenChange, onDeviceConnected }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await callFunction('terraConnect', {
        providers: 'GARMIN,FITBIT,OURA,WHOOP,GOOGLE',
      });

      const widgetUrl = result?.url || result?.data?.url;
      if (widgetUrl) {
        // Open Terra widget in a new window
        const popup = window.open(widgetUrl, 'terra-connect', 'width=500,height=700');
        
        // Poll to detect when the popup closes (user finished connecting)
        const timer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(timer);
            onOpenChange(false);
            if (onDeviceConnected) onDeviceConnected();
          }
        }, 1000);
      } else {
        throw new Error('No widget URL returned from server');
      }
    } catch (err) {
      console.error('Terra connect error:', err);
      setError(err.message || 'Failed to start device connection. Make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Watch className="w-5 h-5" />
            Connect a Wearable
          </DialogTitle>
          <DialogDescription>
            Connect your wearable device or health app to sync your health data with Nucleus.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {['Garmin', 'Fitbit', 'Oura', 'Whoop', 'Google Fit', 'More...'].map((name) => (
              <div key={name} className="p-3 bg-gray-50 rounded-xl">
                <Watch className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <span className="text-gray-700 text-xs">{name}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 mr-2" />
                Connect Device
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-gray-400 text-center pt-4 border-t">
          Powered by Terra API. Your data is encrypted and secure.
        </div>
      </DialogContent>
    </Dialog>
  );
}