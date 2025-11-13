
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Database } from "lucide-react";

export default function APIDocumentation() {
    const apis = [
        {
            method: "POST",
            endpoint: "/terraConnect",
            purpose: "Connect user's wearable device through Terra SDK",
            whenToCall: "After Terra SDK authentication succeeds",
            requestData: {
                user_id: "Your app user ID",
                terra_user_id: "From Terra SDK response", 
                access_token: "From Terra SDK response",
                refresh_token: "From Terra SDK response",
                provider: "APPLE_HEALTH, GOOGLE_FIT, FITBIT, etc."
            },
            example: `await terraConnect({
  user_id: "user123",
  terra_user_id: "terra_abc123",
  access_token: "token_xyz",
  provider: "APPLE_HEALTH"
});`
        },
        {
            method: "GET",
            endpoint: "/healthData",
            purpose: "Get user's health data (steps, heart rate, sleep, etc.)",
            whenToCall: "Load dashboard, show health metrics, generate charts",
            requestData: {
                user_id: "Required - User ID",
                type: "Optional - daily, heart_rate, sleep, activity", 
                limit: "Optional - Number of records (default: 50)"
            },
            example: `// Get all recent data
const data = await healthData({
  user_id: "user123",
  limit: 30
});

// Get only heart rate data
const heartData = await healthData({
  user_id: "user123", 
  type: "heart_rate",
  limit: 100
});`
        },
        {
            method: "POST", 
            endpoint: "/healthData",
            purpose: "Add health data manually (weight, blood pressure, etc.)",
            whenToCall: "User manually enters health data in your app",
            requestData: {
                user_id: "Required - User ID",
                source: "manual, apple_health, google_fit",
                data_type: "weight, blood_pressure, nutrition, etc.",
                data: "Object with the actual health values",
                timestamp: "Optional - When data was recorded"
            },
            example: `await healthData({
  user_id: "user123",
  source: "manual", 
  data_type: "weight",
  data: {
    weight_kg: 75.5,
    date: "2024-01-15"
  }
});`
        },
        {
            method: "POST",
            endpoint: "/syncStatus", 
            purpose: "Check sync status and connected devices",
            whenToCall: "App startup, settings screen, troubleshooting",
            requestData: {
                user_id: "Required - User ID"
            },
            example: `const status = await syncStatus({
  user_id: "user123"
});

// Returns sync info:
// last_sync, connected_devices, sync_health`
        },
        {
            method: "POST",
            endpoint: "/terraUserSync",
            purpose: "Manually sync latest data for specific user",
            whenToCall: "When user pulls to refresh, wants latest data, or troubleshooting",
            requestData: {
                user_id: "Required - User ID"
            },
            example: `await terraUserSync({
  user_id: "user123"
});

// Use this for individual user sync from your app`
        },
        {
            method: "POST",
            endpoint: "/terraInitialSync",
            purpose: "Manually trigger initial data sync from Terra",
            whenToCall: "After connecting device, or for re-syncing historical data",
            requestData: {
                connection_id: "From terraConnect response",
                user_id: "User ID"
            },
            example: `await terraInitialSync({
  connection_id: "conn_123",
  user_id: "user123" 
});`
        },
        {
            method: "POST",
            endpoint: "/terraScheduledSync",
            purpose: "Sync latest data for ALL connected users (background job only)",
            whenToCall: "Set up as scheduled cron job - DO NOT call from React Native app",
            requestData: "No parameters needed",
            example: `// This is for server-side scheduled jobs only
// DO NOT call from your React Native app
await terraScheduledSync();`
        }
    ];

    const dataTypes = [
        { type: "daily", desc: "Steps, calories, distance" },
        { type: "heart_rate", desc: "Heart rate, HRV data" },
        { type: "sleep", desc: "Sleep duration, stages, quality" },
        { type: "activity", desc: "Workouts, exercise sessions" },
        { type: "weight", desc: "Body weight measurements" },
        { type: "blood_pressure", desc: "BP readings" },
        { type: "nutrition", desc: "Food, calories consumed" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Smartphone className="text-blue-600" />
                        Nucleus Health APIs
                    </h1>
                    <p className="text-gray-600">
                        Simple API reference for React Native integration
                    </p>
                </div>

                {/* API Endpoints */}
                <div className="space-y-6">
                    {apis.map((api, index) => (
                        <Card key={index} className="shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <Badge variant={api.method === 'GET' ? 'default' : 'secondary'} className="text-xs">
                                        {api.method}
                                    </Badge>
                                    <code className="text-base font-mono text-blue-600">{api.endpoint}</code>
                                </CardTitle>
                                <p className="text-gray-600 text-sm">{api.purpose}</p>
                                <p className="text-sm text-green-700">
                                    <strong>When to call:</strong> {api.whenToCall}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Request Data */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Request Data:</h4>
                                    {typeof api.requestData === 'object' ? (
                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                            {Object.entries(api.requestData).map(([key, value]) => (
                                                <div key={key} className="mb-1">
                                                    <code className="text-blue-600">{key}:</code> <span className="text-gray-700">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                                            {api.requestData}
                                        </div>
                                    )}
                                </div>

                                {/* Example */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Example:</h4>
                                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                                        <code>{api.example}</code>
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Data Types Reference */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="text-purple-600" />
                            Health Data Types
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {dataTypes.map((type, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <code className="text-sm font-semibold text-purple-600">{type.type}</code>
                                    <p className="text-xs text-gray-600 mt-1">{type.desc}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Integration Note */}
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">React Native Integration</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>• All APIs use <code>POST</code> method except <code>healthData</code> for getting data</p>
                            <p>• Base URL: <code>https://your-app.base44.app/api/functions/</code></p>
                            <p>• Content-Type: <code>application/json</code></p>
                            <p>• Always include user_id to identify which user's data to work with</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
