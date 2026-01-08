import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  MessageSquare, // Changed from Bell to MessageSquare
  Watch, 
  ChevronRight, 
  Moon, 
  Target, 
  Clock,
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
  BarChart,
  Bar
} from "recharts";

import SleepStages from "../components/sleep/SleepStages";

// Mock data for the chart
const chartData = {
  day: [
    { name: '11PM', sleep: 20 }, { name: '12AM', sleep: 80 }, { name: '1AM', sleep: 90 },
    { name: '3AM', sleep: 95 }, { name: '5AM', sleep: 92 }, { name: '6AM', sleep: 75 },
    { name: '7AM', sleep: 30 },
  ],
  week: [
    { name: 'Mon', sleep: 7.5 }, { name: 'Tue', sleep: 8.2 }, { name: 'Wed', sleep: 6.8 },
    { name: 'Thu', sleep: 7.8 }, { name: 'Fri', sleep: 6.5 }, { name: 'Sat', sleep: 8.5 },
    { name: 'Sun', sleep: 6.0 },
  ],
  month: [
    { name: 'W1', sleep: 7.8 }, { name: 'W2', sleep: 7.2 }, { name: 'W3', sleep: 8.1 },
    { name: 'W4', sleep: 6.0 },
  ],
};

const insights = [
  "Your sleep quality has improved by 12% this month. Your consistent bedtime routine is working!",
  "You spent 22 minutes in deep sleep last night, which is 15% above average for your age group.",
  "Consider avoiding screens 1 hour before bed to improve your sleep onset time."
];

export default function SleepPage() {
  const [timeframe, setTimeframe] = useState("day");

  const statCards = [
    { icon: <Target className="w-5 h-5 text-purple-500" />, value: "8h", label: "Goal", color: "bg-purple-50" },
    { icon: <Clock className="w-5 h-5 text-blue-500" />, value: "11:15", label: "Bedtime", color: "bg-blue-50" },
    { icon: <Moon className="w-5 h-5 text-indigo-500" />, value: "7:15", label: "Wake up", color: "bg-indigo-50" },
  ];
  
  // Create a context object with the sleep data
  const sleepContext = {
    type: 'sleep',
    duration: '6h',
    deepSleep: '22m',
    score: 82,
    timeframe: timeframe
  };

  const encodedContext = encodeURIComponent(JSON.stringify(sleepContext));
  const aiAgentUrl = createPageUrl(`AIAgent?context=${encodedContext}`);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Purple Header */}
      <div className="bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-b-3xl p-6 relative h-[500px]">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Sleep</h1>
          <Link to={aiAgentUrl} className="p-2 bg-white/20 rounded-full">
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-bold">6h</h2>
          <p className="text-white/80">22m Deep</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-none hover:bg-white/30">
              Sleep Score: 82
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
                    <p className="text-xs text-gray-500">Sleep tracking, heart rate monitoring</p>
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
                <h3 className="font-semibold text-gray-900 mb-4 pt-4 px-4">Sleep Pattern</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    {timeframe === 'day' ? (
                      <AreaChart data={chartData[timeframe]} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                        <YAxis hide={true} domain={[0, 100]} />
                        <Area type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorSleep)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={chartData[timeframe]} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
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
                        <YAxis hide={true} />
                        <Bar dataKey="sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal/Bedtime/Wake Stats */}
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

          {/* Sleep Stages */}
          <div className="px-4">
            <SleepStages />
          </div>

          {/* Sleep Quality */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Sleep Quality</h3>
                  <span className="text-sm text-purple-600 font-medium">82/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-300" style={{ width: '82%' }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Time to Fall Asleep</p>
                    <p className="font-medium text-gray-900">8 minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sleep Efficiency</p>
                    <p className="font-medium text-gray-900">88%</p>
                  </div>
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