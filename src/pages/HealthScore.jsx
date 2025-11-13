import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  Heart,
  Activity,
  Moon,
  Droplets,
  Apple,
  Target,
  ArrowRight
} from "lucide-react";

export default function HealthScorePage() {
  const [healthScore] = useState(793);
  const [scoreChange] = useState(12); // +12 points this week
  
  const factors = [
    {
      category: 'Sleep Quality',
      impact: 'positive',
      change: '+15 points',
      description: 'Consistent 7-8 hours of sleep this week',
      icon: Moon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      category: 'Heart Rate Variability',
      impact: 'positive',
      change: '+8 points',
      description: 'Improved stress management and recovery',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      category: 'Activity Level',
      impact: 'positive',
      change: '+6 points',
      description: 'Met daily step goals 6 out of 7 days',
      icon: Activity,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      category: 'Hydration',
      impact: 'neutral',
      change: '-2 points',
      description: 'Slightly below hydration targets',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      category: 'Nutrition',
      impact: 'negative',
      change: '-5 points',
      description: 'Missed vegetable intake goals twice',
      icon: Apple,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  const suggestions = [
    {
      title: 'Increase Vegetable Intake',
      description: 'Add 2 more servings of vegetables to boost nutrition score',
      priority: 'high',
      estimatedImpact: '+8 points',
      icon: Apple,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Improve Hydration',
      description: 'Drink 2-3 more glasses of water daily',
      priority: 'medium',
      estimatedImpact: '+5 points',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Add Strength Training',
      description: '2 strength sessions per week can boost your activity score',
      priority: 'medium',
      estimatedImpact: '+6 points',
      icon: Activity,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Maintain Sleep Schedule',
      description: 'Keep your excellent sleep routine consistent',
      priority: 'low',
      estimatedImpact: '+2 points',
      icon: Moon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Health Score</h1>
        <div className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="px-4 space-y-6 pb-24">
        {/* Current Score Card */}
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl border-0 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-6xl font-bold mb-2">{healthScore}</div>
            <p className="text-white/80 mb-4">Your Health Score</p>
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">+{scoreChange} points this week</span>
            </div>
            <div className="mt-4 text-sm text-white/60">
              You're in the top 15% of users in your age group
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">What's Affecting Your Score</h2>
          <div className="space-y-3">
            {factors.map((factor, index) => {
              const IconComponent = factor.icon;
              return (
                <Card key={index} className="bg-white rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${factor.bgColor} rounded-full flex items-center justify-center`}>
                          <IconComponent className={`w-5 h-5 ${factor.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{factor.category}</h3>
                          <p className="text-sm text-gray-500">{factor.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getImpactColor(factor.impact)}`}>
                          {factor.change}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Suggested Actions</h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <Card key={index} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 ${suggestion.bgColor} rounded-full flex items-center justify-center mt-1`}>
                          <IconComponent className={`w-5 h-5 ${suggestion.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                            <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{suggestion.description}</p>
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 font-medium">
                              Potential impact: {suggestion.estimatedImpact}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
                          Start
                        </Button>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Score History */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <div className="space-y-4">
              {[
                { period: 'This Week', score: 793, change: '+12', trend: 'up' },
                { period: 'Last Week', score: 781, change: '+5', trend: 'up' },
                { period: '2 Weeks Ago', score: 776, change: '-3', trend: 'down' },
                { period: '3 Weeks Ago', score: 779, change: '+8', trend: 'up' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.trend === 'up' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">{item.period}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-semibold">{item.score}</span>
                    <span className={`text-sm font-medium ${
                      item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}