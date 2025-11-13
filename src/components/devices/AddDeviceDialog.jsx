import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddDeviceDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Connect a New Source
          </DialogTitle>
          <DialogDescription>
            All health data sources are connected securely through the Nucleus mobile app.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <h3 className="font-semibold text-lg mb-2">Get the Mobile App</h3>
          <p className="text-sm text-gray-600 mb-6">
            Download the mobile app to connect your Apple Health, Garmin, Fitbit, Oura, and other wearables.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-black hover:bg-gray-800 text-white gap-2">
              <Download className="w-4 h-4"/> App Store
            </Button>
            <Button className="bg-black hover:bg-gray-800 text-white gap-2">
              <Download className="w-4 h-4"/> Play Store
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center pt-4 border-t">
          Once connected in the mobile app, your data source will appear here automatically.
        </div>
      </DialogContent>
    </Dialog>
  );
}