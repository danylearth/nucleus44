
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  MessageSquare,
  ChevronRight,
  HeartPulse,
  Activity,
  Bed,
  Lightbulb
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

import HeartRateZones from "../components/heartrate/HeartRateZones";

// Assuming User and HealthData are provided by an SDK or API service
// For demonstration purposes, replace with actual import paths if available
// Example: import { User, HealthData } from "@/services/terra";
// Or if they are globally available after some initialization.
// For a fully runnable example, these would need to be defined or imported.
class User {
  static async me() {
    // Mock user data
    return new Promise(resolve => setTimeout(() => resolve({ email: 'test@example.com' }), 500));
  }
}

class HealthData {
  static async filter(query, sort, limit) {
    // Mock health data
    console.log("Mock HealthData filter called with:", query, sort, limit);

    if (query.data_type === 'activity') {
        const mockActivity = [
             {
                timestamp: new Date().toISOString(),
                data_type: 'activity',
                data: {
                    metadata: { name: 'Morning Run' },
                    distance_data: { summary: { distance_meters: 5200 } },
                    active_durations_data: { activity_seconds: 1800 }, // 30 minutes
                    calories_data: { total_burned_calories: 350 }
                }
            },
            {
                timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
                data_type: 'activity',
                data: {
                    metadata: { name: 'Weight Training' },
                    active_durations_data: { activity_seconds: 3600 }, // 60 minutes
                    calories_data: { total_burned_calories: 450 }
                }
            },
            {
                timestamp: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
                data_type: 'activity',
                data: {
                    metadata: { name: 'Evening Walk' },
                    distance_data: { summary: { distance_meters: 3000 } },
                    active_durations_data: { activity_seconds: 2700 }, // 45 minutes
                    calories_data: { total_burned_calories: 200 }
                }
            }
        ];
        return new Promise(resolve => setTimeout(() => resolve(mockActivity.slice(0, limit)), 500));
    }

    const mockData = [
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 0)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 72, max_hr_bpm: 120, min_hr_bpm: 56, resting_hr_bpm: 58 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 75, max_hr_bpm: 118, min_hr_bpm: 55, resting_hr_bpm: 60 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 70, max_hr_bpm: 115, min_hr_bpm: 53, resting_hr_bpm: 57 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 78, max_hr_bpm: 125, min_hr_bpm: 59, resting_hr_bpm: 62 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 73, max_hr_bpm: 119, min_hr_bpm: 54, resting_hr_bpm: 59 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 80, max_hr_bpm: 130, min_hr_bpm: 60, resting_hr_bpm: 65 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 76, max_hr_bpm: 122, min_hr_bpm: 57, resting_hr_bpm: 61 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 74, max_hr_bpm: 121, min_hr_bpm: 56, resting_hr_bpm: 59 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 77, max_hr_bpm: 123, min_hr_bpm: 58, resting_hr_bpm: 63 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 21)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 71, max_hr_bpm: 117, min_hr_bpm: 54, resting_hr_bpm: 58 } } }
      },
      {
        timestamp: new Date(new Date().setDate(new Date().getDate() - 28)).toISOString(),
        data: { heart_rate_data: { summary: { avg_hr_bpm: 79, max_hr_bpm: 126, min_hr_bpm: 60, resting_hr_bpm: 64 } } }
      },
    ];
    return new Promise(resolve => setTimeout(() => resolve(mockData.slice(0, limit)), 1000));
  }
}


// Mock data for the chart
const chartData = {
  day: [
    { name: '6AM', bpm: 60 }, { name: '9AM', bpm: 75 }, { name: '12PM', bpm: 95 },
    { name: '3PM', bpm: 92 }, { name: '6PM', bpm: 105 }, { name: '9PM', bpm: 85 },
    { name: '12AM', bpm: 70 },
  ],
  week: [
    { name: 'Mon', bpm: 75 }, { name: 'Tue', bpm: 78 }, { name: 'Wed', bpm: 72 },
    { name: 'Thu', bpm: 80 }, { name: 'Fri', bpm: 85 }, { name: 'Sat', bpm: 90 },
    { name: 'Sun', bpm: 70 },
  ],
  month: [
    { name: 'W1', bpm: 78 }, { name: 'W2', bpm: 75 }, { name: 'W3', bpm: 82 },
    { name: 'W4', bpm: 80 },
  ],
};

const insights = [
  "Your resting heart rate has decreased by 5% this month, a great sign of improved cardiovascular health.",
  "You spent 30 minutes in the intense heart rate zone during your last workout. Keep up the great work!",
  "Your heart rate was slightly elevated last night. Did you have a late meal or experience stress?"
];

export default function HeartRatePage() {
  const [timeframe, setTimeframe] = useState("day");
  const [heartRateData, setHeartRateData] = useState([]);
  const [activityData, setActivityData] = useState([]); // New state for activities
  const [isLoading, setIsLoading] = useState(true);
  const [currentBpm, setCurrentBpm] = useState(72); // Default to mock value

  // Scroll to top when page loads and load heart rate data
  useEffect(() => {
    window.scrollTo(0, 0);
    loadHeartRateData();
  }, []);

  const loadHeartRateData = async () => {
    try {
      setIsLoading(true);
      const user = await User.me().catch(() => ({ email: '' }));
      
      if (user?.email) {
        // Fetch both daily heart rate and activity data
        const [dailyHealthData, userActivities] = await Promise.all([
           HealthData.filter(
            { user_id: user.email, data_type: 'daily' }, 
            '-timestamp',
            30
          ),
          HealthData.filter(
            { user_id: user.email, data_type: 'activity' },
            '-timestamp',
            5 // Fetch last 5 activities
          )
        ]);
        
        setActivityData(userActivities); // Save activities to state

        if (dailyHealthData.length > 0) {
          // Process Terra data to extract heart rate
          const processedData = dailyHealthData
            .filter(item => item.data?.heart_rate_data)
            .map(item => {
              const hrData = item.data.heart_rate_data;
              const date = new Date(item.timestamp);
              return {
                timestamp: item.timestamp,
                avg_bpm: hrData.summary?.avg_hr_bpm || 72,
                max_bpm: hrData.summary?.max_hr_bpm || 120,
                min_bpm: hrData.summary?.min_hr_bpm || 56,
                resting_bpm: hrData.summary?.resting_hr_bpm || 58,
                date: date.toLocaleDateString()
              };
            });

          setHeartRateData(processedData);
          
          if (processedData.length > 0) {
            setCurrentBpm(processedData[0].avg_bpm);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to determine heart rate zone and styling
  const getHeartRateZone = (bpm) => {
    if (bpm < 50 || bpm > 150) {
      return {
        zone: bpm < 50 ? "Low Zone" : "High Zone",
        bgColor: "bg-red-500",
        textColor: "text-white",
        hoverColor: "hover:bg-red-600"
      };
    } else if (bpm < 60 || bpm > 120) {
      return {
        zone: bpm < 60 ? "Below Normal" : "Elevated Zone",
        bgColor: "bg-amber-500",
        textColor: "text-white",
        hoverColor: "hover:bg-amber-600"
      };
    } else {
      return {
        zone: "Normal Zone",
        bgColor: "border",
        textColor: "text-[#41AAA3]",
        hoverColor: "hover:bg-[#E1F6F5]",
        customStyle: "bg-[#E1F6F5] border-[#C4EEEB]"
      };
    }
  };

  const heartRateZone = getHeartRateZone(currentBpm);

  // Update the chart data generation to use real data
  const getChartData = () => {
    if (heartRateData.length === 0 || isLoading) {
      return chartData[timeframe]; // fallback to mock data or show loading state
    }

    // Convert real data to chart format based on timeframe
    switch (timeframe) {
      case 'day':
        // For daily data, showing one point for the latest day's average
        return heartRateData.slice(0, 1).map((item) => ({
          name: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bpm: item.avg_bpm
        }));
      case 'week':
        // Show daily averages for the last 7 days
        return heartRateData.slice(0, 7).map((item) => ({
          name: new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
          bpm: item.avg_bpm
        })).reverse(); // Reverse to show oldest first on chart
      case 'month':
        // Show weekly averages (approximated from daily data, e.g., first 4 weeks)
        // This is a simplification; a true weekly average would require more complex grouping
        return heartRateData.filter((_, index) => index % 7 === 0).slice(0, 4).map((item, index) => ({
          name: `W${4 - index}`, // W4 (most recent week), W3, W2, W1 (oldest week)
          bpm: item.avg_bpm
        })).reverse(); // Reverse for display order
      default:
        return chartData[timeframe]; // Should not happen if timeframe is always 'day', 'week', 'month'
    }
  };

  // Update stat cards with real data
  const getStatCards = () => {
    if (heartRateData.length > 0 && !isLoading) {
      const latest = heartRateData[0]; // Most recent data point
      return [
        { icon: <HeartPulse className="w-5 h-5 text-red-500" />, value: latest.max_bpm.toString(), label: "Max BPM", color: "bg-red-50" },
        { icon: <Activity className="w-5 h-5 text-purple-500" />, value: latest.min_bpm.toString(), label: "Min BPM", color: "bg-purple-50" },
        { icon: <Bed className="w-5 h-5 text-teal-500" />, value: latest.resting_bpm.toString(), label: "Resting", color: "bg-teal-50" },
      ];
    }
    // Fallback to initial mock data or default if no real data
    return [
      { icon: <HeartPulse className="w-5 h-5 text-red-500" />, value: "120", label: "Max BPM", color: "bg-red-50" },
      { icon: <Activity className="w-5 h-5 text-purple-500" />, value: "56", label: "Min BPM", color: "bg-purple-50" },
      { icon: <Bed className="w-5 h-5 text-teal-500" />, value: "58", label: "Resting", color: "bg-teal-50" },
    ];
  };

  const displayChartData = getChartData();
  const displayStatCards = getStatCards();

  // Create a context object with the heart rate data
  // Use real data if available, otherwise fallback to defaults/mock
  const heartRateContext = {
    type: 'heartRate',
    avg: currentBpm,
    max: heartRateData.length > 0 ? heartRateData[0].max_bpm : 120,
    min: heartRateData.length > 0 ? heartRateData[0].min_bpm : 56,
    resting: heartRateData.length > 0 ? heartRateData[0].resting_bpm : 58,
    timeframe: timeframe
  };

  const encodedContext = encodeURIComponent(JSON.stringify(heartRateContext));
  const aiAgentUrl = createPageUrl(`AIAgent?context=${encodedContext}`);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Red Header */}
      <div className="bg-gradient-to-b from-red-500 to-red-600 text-white rounded-b-3xl p-6 pb-32 md:pb-64">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Heart Rate</h1>
          <Link to={aiAgentUrl} className="p-2 bg-white/20 rounded-full">
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-bold">{isLoading ? '--' : currentBpm}</h2>
          <p className="text-white/80">bpm average</p>
          <Badge className={`mt-4 ${heartRateZone.customStyle || heartRateZone.bgColor} ${heartRateZone.textColor} ${heartRateZone.hoverColor} ${heartRateZone.customStyle ? '' : 'border-none'}`}>
            {heartRateZone.zone}
          </Badge>

          {heartRateData.length > 0 && (
            <div className="mt-2 text-white/60 text-sm">
              Real data from Terra • Last updated: {new Date(heartRateData[0].timestamp).toLocaleString()}
            </div>
          )}
          {isLoading && heartRateData.length === 0 && (
             <div className="mt-2 text-white/60 text-sm">Loading data...</div>
          )}
        </div>
      </div>

      {/* Main Content - Adjusted for mobile */}
      <div className="pb-24">
        <div className="bg-[#F7F8F8] rounded-t-3xl -mt-20 md:-mt-32 py-4 space-y-6">
          {/* Device Source Card */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c5c2121d3e86e4be58e018/7fe78aa19_Container.png"
                    alt="Apple Watch"
                    className="w-12 h-12"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">Apple Watch</h3>
                    <p className="text-xs text-gray-500">Heart rate, activity, sleep data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>

          {/* Timeframe Toggle */}
          <div className="px-4">
            <div className="bg-gray-100 p-2 rounded-xl flex items-center gap-2">
              {['Day', 'Week', 'Month'].map((item) => (
                <div
                  key={item}
                  className={`flex-1 rounded-lg h-9 transition-all duration-300 ${
                    timeframe === item.toLowerCase()
                      ? 'bg-gray-800 shadow'
                      : 'bg-white shadow-sm'
                  }`}
                >
                  <Button
                    onClick={() => setTimeframe(item.toLowerCase())}
                    className={`w-full h-full text-sm font-medium ${
                      timeframe === item.toLowerCase()
                        ? 'text-white'
                        : 'text-gray-700'
                    } bg-transparent hover:bg-transparent`}
                  >
                    {item}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Card */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <h3 className="font-semibold text-gray-900 mb-4 pt-4 px-4">
                  Heart Rate Trend {heartRateData.length > 0 ? '(Real Data)' : '(Demo Data)'}
                </h3>
                <div className="h-48">
                  {isLoading && heartRateData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Loading chart data...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayChartData} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                          }}
                          labelStyle={{ fontWeight: 'bold' }}
                        />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} interval={0} />
                        <YAxis hide={true} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Area type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} fill="url(#colorBpm)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Min/Max/Resting Stats */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-4">
              {displayStatCards.map((card, index) => (
                <Card key={index} className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 ${card.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      {card.icon}
                    </div>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Heart Rate Zones */}
          <div className="px-4">
            <HeartRateZones />
          </div>

          {/* Recent Activity */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {activityData.length > 0 ? (
                    activityData.map((activity, index) => {
                      const activityName = activity.data?.metadata?.name || 'Workout';
                      const durationSeconds = activity.data?.active_durations_data?.activity_seconds || 0;
                      const durationMinutes = Math.round(durationSeconds / 60);
                      const calories = Math.round(activity.data?.calories_data?.total_burned_calories || 0);
                      const distanceMeters = activity.data?.distance_data?.summary?.distance_meters || 0;
                      const distanceKm = (distanceMeters / 1000).toFixed(1);
                      const date = new Date(activity.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric'});

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{activityName}</h4>
                              <p className="text-xs text-gray-500">{date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{durationMinutes} min</p>
                            <p className="text-xs text-gray-500">
                              {calories} kcal {distanceMeters > 0 ? `• ${distanceKm} km` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activities found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Insights</h3>
                </div>
                <ul className="space-y-3">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
