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
  Brain, 
  Heart, 
  Activity,
  Lightbulb,
  TrendingDown
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import StressLevels from "../components/stress/StressLevels";

// Mock data for the chart
const chartData = {
  day: [
    { name: '6AM', stress: 15 }, { name: '9AM', stress: 30 }, { name: '12PM', stress: 45 },
    { name: '3PM', stress: 50 }, { name: '6PM', stress: 30 }, { name: '9PM', stress: 20 },
    { name: '12AM', stress: 18 },
  ],
  week: [
    { name: 'Mon', stress: 45 }, { name: 'Tue', stress: 38 }, { name: 'Wed', stress: 42 },
    { name: 'Thu', stress: 35 }, { name: 'Fri', stress: 50 }, { name: 'Sat', stress: 25 },
    { name: 'Sun', stress: 32 },
  ],
  month: [
    { name: 'W1', stress: 40 }, { name: 'W2', stress: 38 }, { name: 'W3', stress: 35 },
    { name: 'W4', stress: 32 },
  ],
};

const insights = [
  "Your stress levels have decreased by 8% this month. Your meditation practice is showing results!",
  "Peak stress occurs around 2 PM. Consider taking a 10-minute break during this time.",
  "Your stress recovery is 20% faster than average, indicating good stress management skills."
];

export default function StressPage() {
  const [timeframe, setTimeframe] = useState("day");

  const statCards = [
    { icon: <Heart className="w-5 h-5 text-teal-500" />, value: "32", label: "HRV", color: "bg-teal-50" },
    { icon: <Brain className="w-5 h-5 text-green-500" />, value: "Low", label: "Current", color: "bg-green-50" },
    { icon: <Activity className="w-5 h-5 text-blue-500" />, value: "85%", label: "Recovery", color: "bg-blue-50" },
  ];

  // Create a context object with the stress data
  const stressContext = {
    type: 'stress',
    hrv: 32,
    current: 'Low',
    recovery: '85%',
    timeframe: timeframe
  };
  
  const encodedContext = encodeURIComponent(JSON.stringify(stressContext));
  const aiAgentUrl = createPageUrl(`AIAgent?context=${encodedContext}`);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Teal Header */}
      <div className="bg-gradient-to-b from-teal-500 to-teal-600 text-white rounded-b-3xl p-6 relative h-[500px]">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Stress</h1>
          {/* Replaced Bell icon with MessageSquare linked to AI Agent */}
          <Link to={aiAgentUrl} className="p-2 bg-white/20 rounded-full">
            <MessageSquare className="w-5 h-5" />
          </Link>
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-bold">32</h2>
          <p className="text-white/80">HRV 24 hrs</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-none hover:bg-white/30">
              Low Stress
            </Badge>
            <TrendingDown className="w-4 h-4 text-white/80" />
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
                    <p className="text-xs text-gray-500">Heart rate variability, stress monitoring</p>
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
                <h3 className="font-semibold text-gray-900 mb-4 pt-4 px-4">Stress Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData[timeframe]} margin={{ top: 10, right: 16, left: 16, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
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
                      <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 10']} />
                      <Area type="monotone" dataKey="stress" stroke="#14b8a6" strokeWidth={2} fill="url(#colorStress)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* HRV/Current/Recovery Stats */}
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

          {/* Stress Levels */}
          <div className="px-4">
            <StressLevels />
          </div>

          {/* Stress Management Tips */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Stress Management</h3>
                <div className="space-y-3">
                  {[
                    { activity: 'Deep Breathing', duration: '5 minutes', benefit: 'Reduces cortisol', color: 'bg-blue-500' },
                    { activity: 'Meditation', duration: '10 minutes', benefit: 'Improves HRV', color: 'bg-purple-500' },
                    { activity: 'Light Exercise', duration: '15 minutes', benefit: 'Releases endorphins', color: 'bg-green-500' },
                  ].map((tip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 ${tip.color} rounded-full`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{tip.activity}</h4>
                          <p className="text-xs text-gray-500">{tip.benefit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{tip.duration}</p>
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