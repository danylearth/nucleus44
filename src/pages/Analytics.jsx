import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Heart,
  Footprints,
  Bed,
  BarChart3,
  ArrowRight
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Health Score trend data
const healthScoreTrends = [
  { name: 'Jan', score: 720, sleep: 75, activity: 80, heart: 85, nutrition: 70 },
  { name: 'Feb', score: 735, sleep: 78, activity: 82, heart: 87, nutrition: 72 },
  { name: 'Mar', score: 750, sleep: 80, activity: 85, heart: 88, nutrition: 75 },
  { name: 'Apr', score: 768, sleep: 82, activity: 87, heart: 90, nutrition: 78 },
  { name: 'May', score: 785, sleep: 85, activity: 89, heart: 92, nutrition: 80 },
  { name: 'Jun', score: 793, sleep: 87, activity: 91, heart: 94, nutrition: 82 }
];

const scoreFactors = [
  {
    category: 'Sleep Quality',
    impact: 'positive',
    change: '+15 points',
    contribution: 87,
    description: 'Consistent 7-8 hours, good deep sleep',
    icon: Bed,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    barColor: '#8b5cf6'
  },
  {
    category: 'Heart Health',
    impact: 'positive', 
    change: '+12 points',
    contribution: 94,
    description: 'Excellent resting HR and HRV',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    barColor: '#ef4444'
  },
  {
    category: 'Activity Level',
    impact: 'positive',
    change: '+8 points',
    contribution: 91,
    description: 'Meeting daily step and exercise goals',
    icon: Activity,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
    barColor: '#06b6d4'
  },
  {
    category: 'Nutrition',
    impact: 'neutral',
    change: '+2 points',
    contribution: 82,
    description: 'Good balance, room for more vegetables',
    icon: Footprints,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    barColor: '#10b981'
  }
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("6months");
  const [currentScore, setCurrentScore] = useState(793);
  const [scoreChange, setScoreChange] = useState(8);

  const StatCard = ({ icon: Icon, title, value, change, changeType, color, subtitle }) => (
    <Card className="bg-white rounded-2xl border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {change && (
            <Badge className={`text-xs ${changeType === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {changeType === 'positive' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 pt-8 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Health Score Analytics
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Understanding your {currentScore} health score
          </p>
        </div>
        <div className="flex gap-2">
          {['3M', '6M', '1Y'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period.toLowerCase().replace('m', 'months').replace('y', 'year') ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period.toLowerCase().replace('m', 'months').replace('y', 'year'))}
              className="text-xs"
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Current Score Overview */}
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl border-0 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm text-white/80 mb-1">Current Health Score</h2>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{currentScore}</span>
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-medium text-green-300">+{scoreChange} this month</span>
                </div>
              </div>
              <p className="text-white/70 text-sm">Top 15% in your age group</p>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white border-none mb-2">
                Excellent
              </Badge>
              <p className="text-xs text-white/60">Keep it up!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Trend */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Health Score Trend</CardTitle>
          <p className="text-sm text-gray-500">Your score has improved by {scoreChange} points this month</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthScoreTrends}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#scoreGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Score Components */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Score Breakdown</CardTitle>
          <p className="text-sm text-gray-500">How each health area contributes to your score</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scoreFactors.map((factor, index) => {
              const IconComponent = factor.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 ${factor.bgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${factor.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">{factor.category}</h3>
                        <span className="text-sm font-medium text-gray-900">{factor.contribution}%</span>
                      </div>
                      <p className="text-sm text-gray-500">{factor.description}</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${factor.contribution}%`, 
                            backgroundColor: factor.barColor 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Component Trends */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Component Trends</CardTitle>
          <p className="text-sm text-gray-500">How each health area has changed over time</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthScoreTrends}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide domain={[60, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="heart" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="activity" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="nutrition" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Improvement Recommendations */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Score Improvement Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                title: 'Increase Vegetable Intake',
                description: 'Adding 2 servings daily could boost your nutrition score',
                impact: '+8 points',
                priority: 'high'
              },
              {
                title: 'Add Strength Training', 
                description: '2 sessions per week to improve activity diversity',
                impact: '+5 points',
                priority: 'medium'
              },
              {
                title: 'Optimize Sleep Schedule',
                description: 'Consistent bedtime for better sleep quality',
                impact: '+3 points',
                priority: 'low'
              }
            ].map((recommendation, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
                    <Badge 
                      className={`text-xs ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-600' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}
                    >
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{recommendation.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-green-600">{recommendation.impact}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score History */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent Score Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { period: 'This Month', score: 793, change: '+8', reason: 'Improved sleep consistency' },
              { period: 'Last Month', score: 785, change: '+17', reason: 'Increased activity level' },
              { period: '2 Months Ago', score: 768, change: '+18', reason: 'Better nutrition tracking' },
              { period: '3 Months Ago', score: 750, change: '+15', reason: 'Heart health improvements' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{item.period}</p>
                  <p className="text-sm text-gray-500">{item.reason}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.score}</p>
                  <p className="text-sm text-green-600 font-medium">{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}