
import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Bell, 
  Droplets, 
  Target, 
  Plus,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import WaterIntakeLog from "../components/water/WaterIntakeLog";

// Mock data for the chart
const chartData = {
  day: [
    { name: '8AM', water: 0.5 }, { name: '10AM', water: 0.75 }, { name: '12PM', water: 1.0 },
    { name: '2PM', water: 1.25 }, { name: '4PM', water: 1.5 }, { name: '6PM', water: 1.5 },
    { name: '8PM', water: 1.5 },
  ],
  week: [
    { name: 'Mon', water: 2.2 }, { name: 'Tue', water: 1.8 }, { name: 'Wed', water: 2.0 },
    { name: 'Thu', water: 2.4 }, { name: 'Fri', water: 1.6 }, { name: 'Sat', water: 2.1 },
    { name: 'Sun', water: 1.5 },
  ],
  month: [
    { name: 'W1', water: 2.0 }, { name: 'W2', water: 1.9 }, { name: 'W3', water: 2.2 },
    { name: 'W4', water: 1.8 },
  ],
};

const insights = [
  "You're drinking 15% more water this week compared to last week. Great hydration habits!",
  "Your best hydration time is in the morning. Try to maintain this consistency throughout the day.",
  "You've met your daily water goal 5 out of 7 days this week. Keep up the good work!"
];

export default function WaterPage() {
  const [timeframe, setTimeframe] = useState("day");

  const statCards = [
    { icon: <Target className="w-5 h-5 text-blue-500" />, value: "2L", label: "Goal", color: "bg-blue-50" },
    { icon: <Droplets className="w-5 h-5 text-cyan-500" />, value: "6", label: "Glasses", color: "bg-cyan-50" },
    { icon: <Plus className="w-5 h-5 text-green-500" />, value: "0.5L", label: "Remaining", color: "bg-green-50" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Blue Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-b-3xl p-6 relative">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-semibold">Water Intake</h1>
          <div className="p-2 bg-white/20 rounded-full">
            <Bell className="w-5 h-5" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-6xl font-bold">1.5L</h2>
          <p className="text-white/80">today's intake</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-none hover:bg-white/30">
              75% of goal
            </Badge>
            <TrendingUp className="w-4 h-4 text-white/80" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-6">
        <div className="bg-white rounded-t-3xl py-4 space-y-6 transform -translate-y-6">
          {/* Quick Add Water */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Add</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { amount: '250ml', icon: '🥤', label: 'Glass' },
                    { amount: '500ml', icon: '🍶', label: 'Bottle' },
                    { amount: '750ml', icon: '🏺', label: 'Large' },
                    { amount: '1L', icon: '🪣', label: 'Jug' },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-16 flex flex-col gap-1 rounded-xl border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs text-gray-600">{item.amount}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeframe & Chart Card */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="bg-gray-100 p-1 rounded-xl flex items-center mb-4">
                  {['Day', 'Week', 'Month'].map((item) => (
                    <Button
                      key={item}
                      onClick={() => setTimeframe(item.toLowerCase())}
                      className={`flex-1 rounded-lg h-8 text-sm transition-all duration-200 ${
                        timeframe === item.toLowerCase()
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'bg-transparent text-gray-500 shadow-none'
                      }`}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
                <h3 className="font-semibold text-gray-900 mb-4">Water Intake Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData[timeframe]}>
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(4px)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        }}
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => [`${value}L`, 'Water']}
                      />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis hide={true} />
                      <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goal/Glasses/Remaining Stats */}
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

          {/* Daily Goal Progress */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Daily Goal Progress</h3>
                  <span className="text-sm text-blue-600 font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>1.5L consumed</span>
                  <span>0.5L remaining</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Water Intake Log */}
          <div className="px-4">
            <WaterIntakeLog />
          </div>

          {/* Hydration Tips */}
          <div className="px-4">
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Hydration Tips</h3>
                <div className="space-y-3">
                  {[
                    { tip: 'Start your day with water', benefit: 'Kickstarts metabolism', icon: '🌅' },
                    { tip: 'Drink before meals', benefit: 'Improves digestion', icon: '🍽️' },
                    { tip: 'Set hourly reminders', benefit: 'Maintains consistency', icon: '⏰' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.tip}</h4>
                          <p className="text-xs text-gray-500">{item.benefit}</p>
                        </div>
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
