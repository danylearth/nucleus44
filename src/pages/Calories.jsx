import { useState } from "react";
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
  Flame, 
  Target, 
  Utensils,
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

import CalorieBreakdown from "../components/calories/CalorieBreakdown";

// Mock data for the chart
const chartData = {
  day: [
    { name: '6AM', calories: 50 }, { name: '9AM', calories: 150 }, { name: '12PM', calories: 320 },
    { name: '3PM', calories: 500 }, { name: '6PM', calories: 750 }, { name: '9PM', calories: 900 },
    { name: '12AM', calories: 933 },
  ],
  week: [
    { name: 'Mon', calories: 850 }, { name: 'Tue', calories: 920 }, { name: 'Wed', calories: 780 },
    { name: 'Thu', calories: 1050 }, { name: 'Fri', calories: 980 }, { name: 'Sat', calories: 1150 },
    { name: 'Sun', calories: 933 },
  ],
  month: [
    { name: 'W1', calories: 950 }, { name: 'W2', calories: 880 }, { name: 'W3', calories: 1020 },
    { name: 'W4', calories: 933 },
  ],
};

const insights = [
  "You burned 15% more calories this week compared to last week. Your increased activity is paying off!",
  "Your highest calorie burn was during your 2 PM workout session. Consider scheduling more afternoon activities.",
  "You're consistently meeting your daily calorie goals. Keep up the excellent work!"
];

export default function CaloriesPage() {
  const [timeframe, setTimeframe] = useState("day");

  const statCards = [
    { icon: <Target className="w-5 h-5 text-green-500" />, value: "1,200", label: "Goal", color: "bg-green-50" },
    { icon: <Flame className="w-5 h-5 text-orange-500" />, value: "933", label: "Burned", color: "bg-orange-50" },
    { icon: <Utensils className="w-5 h-5 text-blue-500" />, value: "1,850", label: "Consumed", color: "bg-blue-50" },
  ];

  // Create a context object with the calorie data
  const calorieContext = {
    type: 'calories',
    burned: 933,
    goal: 1200,
    consumed: 1850,
    timeframe: timeframe
  };

  const encodedContext = encodeURIComponent(JSON.stringify(calorieContext));
  const aiAgentUrl = createPageUrl(`AIAgent?context=${encodedContext}`);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Orange Header */}
      <div className="bg-gradient-to-b from-orange-500 to-orange-600 text-white rounded-b-3xl p-6 relative h-[500px]">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Calories</h1>
          <Link to={aiAgentUrl} className="p-2 bg-white/20 rounded-full">
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-bold">933</h2>
          <p className="text-white/80">kcal burned</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-none hover:bg-white/30">
              78% of goal
            </Badge>
            <TrendingUp className="w-4 h-4 text-white/80" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-6">
        <div className="bg-[#F7F8F8] rounded-t-3xl py-4 space-y-6 transform -translate-y-[240px]">
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
                    <p className="text-xs text-gray-500">Activity tracking, workout data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </CardContent>
            </Card>
          </div> */}

          {/* Timeframe Toggle - Outside of Chart Card */}
          <div className="px-4">
            <div className="bg-gray-100 p-2 rounded-xl flex items-center gap-2">
              {['Day', 'Week', 'Month'].map((item) => (
                <div
                  key={item}
                  className={`w-28 rounded-lg h-9 transition-all duration-300 ${
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
                <h3 className="font-semibold text-gray-900 mb-4 pt-4 px-4">Calories Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData[timeframe]} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
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
                      <YAxis hide={true} domain={['dataMin - 10', 'dataMax + 50']} />
                      <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fill="url(#colorCalories)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal/Burned/Consumed Stats */}
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

          {/* Calorie Breakdown */}
          <div className="px-4">
            <CalorieBreakdown />
          </div>

          {/* Daily Goal Progress */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Daily Goal Progress</h3>
                  <span className="text-sm text-orange-600 font-medium">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-300" style={{ width: '78%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>933 burned</span>
                  <span>267 remaining to goal</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Activity Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { activity: 'Morning Run', time: '7:00 AM', calories: 320, color: 'bg-red-500' },
                    { activity: 'Strength Training', time: '6:00 PM', calories: 280, color: 'bg-blue-500' },
                    { activity: 'Walking', time: 'Throughout day', calories: 180, color: 'bg-green-500' },
                    { activity: 'Daily Activities', time: 'Throughout day', calories: 153, color: 'bg-purple-500' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.activity}</h4>
                          <p className="text-xs text-gray-500">{item.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.calories} cal</p>
                      </div>
                    </div>
                  ))}
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