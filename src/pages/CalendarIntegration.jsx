import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Bell
} from "lucide-react";

// Using img tags for specific calendar logos to match the design reference.
const ICloudCalendarIcon = () => (
    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex flex-col items-center justify-center shadow-sm p-1">
        <div className="w-full text-center bg-red-500 rounded-t-md h-3.5">
             <span className="text-[8px] font-bold text-white">JUL</span>
        </div>
        <div className="text-xl font-bold text-gray-700 -mt-1">17</div>
    </div>
);

const GoogleCalendarIcon = () => (
    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm p-1">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-8 h-8" />
    </div>
);

const OutlookCalendarIcon = () => (
    <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm p-1">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/2048px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png" alt="Outlook Calendar" className="w-7 h-7" />
    </div>
);


export default function CalendarIntegrationPage() {
  const [integrations, setIntegrations] = useState([
    { id: 'icloud', name: 'iCloud Calendar', connected: true, icon: <ICloudCalendarIcon /> },
    { id: 'google', name: 'Google Calendar', connected: false, icon: <GoogleCalendarIcon /> },
    { id: 'outlook', name: 'Outlook Calendar', connected: false, icon: <OutlookCalendarIcon /> },
  ]);

  const handleToggleConnect = (id) => {
    // In a real app, this would trigger an OAuth flow. Here, we just toggle the state.
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Profile")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Calendar Integration</h1>
        <div className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="px-4">
        <p className="text-gray-600 text-sm mb-8">
          Connect your calendar to sync health appointments, medication reminders, and wellness events.
        </p>
        
        <div className="space-y-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {integration.icon}
                  <div>
                    <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                    <p className={`text-sm ${integration.connected ? 'text-teal-600' : 'text-gray-500'}`}>
                      {integration.connected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleToggleConnect(integration.id)}
                  variant={integration.connected ? 'outline' : 'default'}
                  className={`rounded-lg ${
                    integration.connected 
                      ? 'bg-white text-gray-700' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}