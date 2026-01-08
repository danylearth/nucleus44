import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  MessageSquare,
  Watch, 
  ChevronRight, 
  Footprints, 
  Target, 
  MapPin,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StepsPage() {
  const [timeframe, setTimeframe] = useState("day");
  const [stepsData, setStepsData] = useState(null);
  const [chartData, setChartData] = useState({ day: [], week: [], month: [] });
  const [activityBreakdown, setActivityBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStepsData();
  }, []);

  const loadStepsData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      
      if (currentUser?.id) {
        // Fetch health data for the last 30 days
        const healthRecords = await base44.entities.HealthData.filter(
          { user_id: currentUser.id }, 
          '-synced_at',
          100
        );
        
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Get today's records
        const todayRecords = healthRecords.filter(record => {
          if (!record.synced_at) return false;
          const syncDate = record.synced_at.split('T')[0];
          return syncDate === today;
        });
        
        // Extract today's steps
        const dailyData = todayRecords.find(item => item.data_type === 'daily');
        let totalSteps = 0;
        let distance = 0;
        let floors = 0;
        
        if (dailyData?.data) {
          totalSteps = dailyData.data.distance_data?.steps || 0;
          distance = dailyData.data.distance_data?.distance_meters 
            ? (dailyData.data.distance_data.distance_meters / 1609.34).toFixed(1)
            : 0;
          floors = dailyData.data.distance_data?.floors_climbed || 0;
        }
        
        // If no daily data, sum from activities
        if (totalSteps === 0) {
          const activities = todayRecords.filter(item => item.data_type === 'activity');
          totalSteps = activities.reduce((sum, activity) => {
            return sum + (activity.data.distance_data?.steps || 0);
          }, 0);
          
          const totalDistance = activities.reduce((sum, activity) => {
            return sum + (activity.data.distance_data?.distance_meters || 0);
          }, 0);
          distance = (totalDistance / 1609.34).toFixed(1);
        }
        
        setStepsData({
          steps: totalSteps,
          goal: 10000,
          miles: parseFloat(distance),
          floors: floors,
          progress: Math.min((totalSteps / 10000) * 100, 100)
        });

        // Process chart data for different timeframes
        processChartData(healthRecords);
        
        // Process activity breakdown for today
        processActivityBreakdown(todayRecords);
      }
    } catch (error) {
      console.error('Error loading steps data:', error);
      setStepsData({
        steps: 0,
        goal: 10000,
        miles: 0,
        floors: 0,
        progress: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = (healthRecords) => {
    const now = new Date();
    
    // DAY VIEW: Hourly breakdown from activities (if available)
    const todayDate = now.toISOString().split('T')[0];
    const todayActivities = healthRecords.filter(record => {
      if (!record.synced_at || record.data_type !== 'activity') return false;
      return record.synced_at.split('T')[0] === todayDate;
    });

    const hourlySteps = new Array(24).fill(0);
    todayActivities.forEach(activity => {
      if (activity.data?.metadata?.start_time) {
        const hour = new Date(activity.data.metadata.start_time).getHours();
        hourlySteps[hour] += activity.data.distance_data?.steps || 0;
      }
    });

    const dayData = [];
    let cumulativeSteps = 0;
    for (let i = 0; i < 24; i += 3) {
      cumulativeSteps += hourlySteps[i] + hourlySteps[i+1] + hourlySteps[i+2];
      const hour = i === 0 ? '12AM' : i < 12 ? `${i}AM` : i === 12 ? '12PM' : `${i-12}PM`;
      dayData.push({ name: hour, steps: cumulativeSteps });
    }

    // WEEK VIEW: Last 7 days
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = healthRecords.filter(record => {
        if (!record.synced_at) return false;
        return record.synced_at.split('T')[0] === dateStr;
      });
      
      const dailyRecord = dayRecords.find(r => r.data_type === 'daily');
      let steps = dailyRecord?.data?.distance_data?.steps || 0;
      
      if (steps === 0) {
        steps = dayRecords
          .filter(r => r.data_type === 'activity')
          .reduce((sum, act) => sum + (act.data.distance_data?.steps || 0), 0);
      }
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      weekData.push({ name: dayName, steps });
    }

    // MONTH VIEW: Last 4 weeks
    const monthData = [];
    for (let week = 3; week >= 0; week--) {
      let weekSteps = 0;
      for (let day = 0; day < 7; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (week * 7 + day));
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRecords = healthRecords.filter(record => {
          if (!record.synced_at) return false;
          return record.synced_at.split('T')[0] === dateStr;
        });
        
        const dailyRecord = dayRecords.find(r => r.data_type === 'daily');
        let steps = dailyRecord?.data?.distance_data?.steps || 0;
        
        if (steps === 0) {
          steps = dayRecords
            .filter(r => r.data_type === 'activity')
            .reduce((sum, act) => sum + (act.data.distance_data?.steps || 0), 0);
        }
        
        weekSteps += steps;
      }
      
      monthData.push({ name: `W${4 - week}`, steps: Math.round(weekSteps / 7) });
    }

    setChartData({ day: dayData, week: weekData, month: monthData });
  };

  const processActivityBreakdown = (todayRecords) => {
    const activities = todayRecords.filter(item => item.data_type === 'activity');
    
    const breakdown = activities.map(activity => {
      const activityName = activity.data?.metadata?.name || 'Activity';
      const steps = activity.data?.distance_data?.steps || 0;
      const distanceMeters = activity.data?.distance_data?.distance_meters || 0;
      const distanceKm = (distanceMeters / 1000).toFixed(1);
      const durationSeconds = activity.data?.active_durations_data?.activity_seconds || 0;
      const durationMinutes = Math.round(durationSeconds / 60);
      
      return {
        activity: activityName,
        steps: steps,
        time: distanceMeters > 0 ? `${distanceKm} km` : `${durationMinutes} min`,
        percentage: 0 // Will calculate below
      };
    });

    // Calculate percentages
    const totalSteps = breakdown.reduce((sum, item) => sum + item.steps, 0);
    if (totalSteps > 0) {
      breakdown.forEach(item => {
        item.percentage = Math.round((item.steps / totalSteps) * 100);
      });
    }

    // Sort by steps descending
    breakdown.sort((a, b) => b.steps - a.steps);
    
    setActivityBreakdown(breakdown);
  };

  const insights = [
    stepsData?.steps > stepsData?.goal 
      ? "🎉 Congratulations! You've exceeded your daily step goal!" 
      : "Your most active period is typically between 2-6 PM. Consider scheduling walks during this time.",
    stepsData?.progress >= 80 
      ? "You're so close to your goal! Just a few more steps to go!" 
      : "Try taking the stairs or parking further away to add more steps throughout your day.",
    "Consistent daily movement is more beneficial than occasional intense activity. Keep up your routine!"
  ];

  const statCards = [
    { icon: <Target className="w-5 h-5 text-blue-500" />, value: stepsData?.goal?.toLocaleString() || "10,000", label: "Goal", color: "bg-blue-50" },
    { icon: <Footprints className="w-5 h-5 text-cyan-500" />, value: stepsData?.miles || "0", label: "Miles", color: "bg-cyan-50" },
    { icon: <MapPin className="w-5 h-5 text-green-500" />, value: stepsData?.floors || "0", label: "Floors", color: "bg-green-50" },
  ];

  const stepsContext = {
    type: 'steps',
    steps: stepsData?.steps || 0,
    goal: stepsData?.goal || 10000,
    miles: stepsData?.miles || 0,
    timeframe: timeframe
  };

  const encodedContext = encodeURIComponent(JSON.stringify(stepsContext));
  const aiAgentUrl = createPageUrl(`AIAgent?context=${encodedContext}`);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading steps data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Cyan Header */}
      <div className="bg-gradient-to-b from-cyan-500 to-cyan-600 text-white rounded-b-3xl p-6 pb-32 md:pb-64">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Steps</h1>
          <Link to={aiAgentUrl} className="p-2 bg-white/20 rounded-full">
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-bold">{stepsData?.steps?.toLocaleString() || "0"}</h2>
          <p className="text-white/80">steps today</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-none hover:bg-white/30">
              {Math.round(stepsData?.progress || 0)}% of goal
            </Badge>
            <TrendingUp className="w-4 h-4 text-white/80" />
          </div>
          {stepsData?.steps === 0 && (
            <p className="text-white/60 text-sm mt-2">No data synced today</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-24">
        <div className="bg-white rounded-t-3xl -mt-20 md:-mt-32 py-4 space-y-6">
          {/* Device Source Card */}
          {/* <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-lg">
                    <Watch className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Apple Watch</h3>
                    <p className="text-xs text-gray-500">Step counting, distance tracking</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </div> */}

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

          {/* Chart Card - NOW WITH LIVE DATA */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <h3 className="font-semibold text-gray-900 mb-4 pt-4 px-4">Steps Trend</h3>
                <div className="h-48">
                  {chartData[timeframe].length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData[timeframe]} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
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
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis hide={true} domain={['dataMin - 100', 'dataMax + 500']} />
                        <Area type="monotone" dataKey="steps" stroke="#06b6d4" strokeWidth={2} fill="url(#colorSteps)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No chart data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal/Miles/Floors Stats */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-4">
              {statCards.map((card, index) => (
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

          {/* Steps Breakdown - NOW WITH LIVE DATA */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Footprints className="w-5 h-5 text-cyan-500" />
                  <h3 className="font-semibold text-gray-900">Activity Breakdown</h3>
                </div>

                {activityBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {activityBreakdown.map((item, index) => {
                      const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.activity}</h4>
                              <p className="text-xs text-gray-500">{item.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{item.steps.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{item.percentage}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No activity data available for today</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Daily Goal Progress */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Daily Goal Progress</h3>
                  <span className="text-sm text-cyan-600 font-medium">{Math.round(stepsData?.progress || 0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-3 rounded-full transition-all duration-300" style={{ width: `${stepsData?.progress || 0}%` }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{stepsData?.steps?.toLocaleString() || 0} steps</span>
                  <span>{Math.max(0, (stepsData?.goal || 10000) - (stepsData?.steps || 0)).toLocaleString()} steps to goal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights - Dynamic based on data */}
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