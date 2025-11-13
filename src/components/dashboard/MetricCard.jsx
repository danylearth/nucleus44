
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Footprints, Zap, Bed, Brain } from "lucide-react";
import HeartIcon from "../icons/HeartIcon";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function MetricCard({ metric, fullWidth = false }) {
  // If metric is undefined, don't render
  if (!metric) {
    return null;
  }

  // Check for various "no data" conditions
  const isEmptyValue = 
    metric.value === '0' || 
    metric.value === 'N/A' || 
    metric.value === '0h' ||  // Sleep with 0 hours
    metric.value === '' ||
    metric.value === null ||
    metric.value === undefined;

  // Don't render if there's no meaningful data for general cards,
  // but special cards like Heart Rate, Steps, Calories will handle this internally.
  if (isEmptyValue && 
      metric.label !== 'Heart Rate' && 
      metric.label !== 'Steps' && 
      metric.label !== 'Cals' && 
      metric.label !== 'Calories') {
    return null;
  }

  const renderChart = () => {
    switch (metric.chart) {
      case 'heart':
        return (
          <div className="h-24 flex items-end justify-center gap-0.5">
            <div className="w-1 bg-red-300 rounded-full" style={{ height: '60%' }}></div>
            <div className="w-1 bg-red-400 rounded-full" style={{ height: '80%' }}></div>
            <div className="w-1 bg-red-500 rounded-full" style={{ height: '40%' }}></div>
            <div className="w-1 bg-red-400 rounded-full" style={{ height: '90%' }}></div>
            <div className="w-1 bg-red-300 rounded-full" style={{ height: '50%' }}></div>
            <div className="w-1 bg-red-500 rounded-full" style={{ height: '70%' }}></div>
          </div>);

      case 'sleep':
        return (
          <div className="h-8 flex items-end justify-center gap-0.5">
            {[20, 40, 60, 30, 80, 50, 70, 90, 45, 65].map((height, i) =>
            <div
              key={i}
              className="w-1 bg-purple-400 rounded-full"
              style={{ height: `${height}%` }}>
            </div>
            )}
          </div>);

      case 'stress':
        return (
          <div className="h-8 flex items-center">
            <svg className="w-full h-6" viewBox="0 0 60 20">
              <path
                d="M 0 15 Q 10 5 20 10 T 40 8 T 60 12"
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                className="opacity-80" />

              <path
                d="M 0 15 Q 10 5 20 10 T 40 8 T 60 12 L 60 20 L 0 20 Z"
                fill="#10b981"
                className="opacity-20" />

            </svg>
          </div>);

      case 'running':
        return (
          <div className="h-8 flex items-end justify-center gap-0.5">
            {[30, 70, 45, 80, 60, 90, 55, 75, 65, 85].map((height, i) =>
            <div
              key={i}
              className="w-1 bg-emerald-400 rounded-full"
              style={{ height: `${height}%` }}>
            </div>
            )}
          </div>);

      default:
        return null;
    }
  };

  // Special layout for Heart Rate card
  if (metric.label === 'Heart Rate') {
    const heartRateData = [
    { name: 'Page A', bpm: 60 },
    { name: 'Page B', bpm: 75 },
    { name: 'Page C', bpm: 65 },
    { name: 'Page D', bpm: 80 },
    { name: 'Page E', bpm: 70 },
    { name: 'Page F', bpm: 90 },
    { name: 'Page G', bpm: 85 },
    { name: 'Page H', bpm: 75 }];


    const CardInner =
    <Card className="bg-white rounded-2xl border-0 subtle-shadow w-full" style={{ height: '318px' }}>
        <CardContent className="pt-4 pr-4 pb-6 pl-4 h-full flex flex-col">
          {/* Header with icon and title */}
          <div className="flex items-center gap-2 mb-6">
            <HeartIcon className="w-5 h-5 text-red-500" />
            <span className="text-base font-medium text-gray-900">Heart Rate</span>
          </div>

          {/* Large number and status */}
          <div className="mb-8 flex items-baseline gap-2">
            {isEmptyValue ? (
              <div className="flex flex-col">
                <span className="text-6xl font-bold text-gray-300">--</span>
                <span className="text-sm text-gray-400 mt-2">No data synced yet</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-6xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-gray-500 text-sm">{metric.unit}</span>
                </div>
                <Badge className="bg-teal-50 text-teal-600 text-sm border-teal-200 transform scale-95">
                  {metric.status}
                </Badge>
              </>
            )}
          </div>

          {/* Chart area */}
          {!isEmptyValue && (
            <div className="flex-1 relative -mx-4 -mb-6">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={heartRateData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#fda4af" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <Tooltip
                  cursor={false}
                  contentStyle={{ display: 'none' }} />

                    <Area
                  type="monotone"
                  dataKey="bpm"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fill="url(#heartGradient)"
                  dot={false} />

                  </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>;


    return <Link to={createPageUrl("HeartRate")}>{CardInner}</Link>;
  }

  // Special layout for Steps card - USES REAL DATA
  if (metric.label === 'Steps') {
    const CardInner =
    <Card className="bg-white rounded-2xl border-0 subtle-shadow w-full" style={{ height: '151px' }}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="mb-3 flex items-center gap-2">
            <Footprints className="w-5 h-5" style={{ color: '#4ECDC4' }} />
            <span className="text-base font-medium text-gray-900">Steps</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {isEmptyValue ? (
              <>
                <span className="text-gray-300 text-2xl font-bold">--</span>
                <span className="text-xs text-gray-400 mt-1">No data synced yet</span>
              </>
            ) : (
              <>
                <span className="text-gray-900 text-2xl font-bold">{metric.value}</span>
                <span className="text-base text-gray-500">{metric.unit}</span>
              </>
            )}
          </div>
          {!isEmptyValue && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: `${metric.progress}%`, backgroundColor: '#4ECDC4' }}></div>
            </div>
          )}
        </CardContent>
      </Card>;

    return <Link to={createPageUrl("Steps")}>{CardInner}</Link>;
  }

  // Special layout for Calories card - USES REAL DATA
  if (metric.label === 'Cals' || metric.label === 'Calories') {
    const CardInner =
    <Card className="bg-white rounded-2xl border-0 subtle-shadow w-full" style={{ height: '151px' }}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5" style={{ color: '#4ECDC4' }} />
            <span className="text-base font-medium text-gray-900">Cals</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            {isEmptyValue ? (
              <>
                <span className="text-gray-300 text-2xl font-bold">--</span>
                <span className="text-xs text-gray-400 mt-1">No data synced yet</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold">{metric.value}</span>
                <span className="text-base text-gray-500">{metric.unit}</span>
              </>
            )}
          </div>
          {!isEmptyValue && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: `${metric.progress}%`, backgroundColor: '#4ECDC4' }}></div>
            </div>
          )}
        </CardContent>
      </Card>;

    return <Link to={createPageUrl("Calories")}>{CardInner}</Link>;
  }
  
  // Special layout for Sleep card - NOW USES REAL DATA
  if (metric.label === 'Sleep') {
    const sleepData = [
      { h: 30 }, { h: 50 }, { h: 40 }, { h: 20 }, { h: 60 }, { h: 35 }, { h: 70 },
      { h: 55 }, { h: 45 }, { h: 80 }, { h: 65 }, { h: 50 },
    ];
    const CardInner = (
      <Card className="bg-white rounded-2xl border-0 subtle-shadow w-full" style={{ height: '206px' }}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Bed className="w-5 h-5" style={{ color: '#4ECDC4' }} />
            <span className="text-base font-medium text-gray-900">Sleep</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold">{metric.value}</span>
            </div>
            {metric.subtitle && (
              <span className="text-xs text-gray-400 mt-0.5">{metric.subtitle}</span>
            )}
          </div>
          <div className="h-8 -mb-1 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} barGap={2}>
                <Bar dataKey="h" fill="#4ECDC4" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
    return <Link to={createPageUrl("Sleep")}>{CardInner}</Link>;
  }
  
  // Special layout for Stress card - NOW USES REAL DATA
  if (metric.label === 'Stress') {
    const stressData = [
      { v: 10 }, { v: 15 }, { v: 12 }, { v: 25 }, { v: 35 }, { v: 30 },
      { v: 22 }, { v: 40 }, { v: 38 }, { v: 28 }, { v: 32 }, { v: 25 },
    ];
    const CardInner = (
      <Card className="bg-white rounded-2xl border-0 subtle-shadow w-full" style={{ height: '206px' }}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5" style={{ color: '#4ECDC4' }} />
            <span className="text-base font-medium text-gray-900">Stress</span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-gray-500 font-medium">{metric.unit}</span>
            </div>
            {metric.subtitle && (
              <span className="text-xs text-gray-400">{metric.subtitle}</span>
            )}
          </div>
          <div className="h-10 -mb-5 -mx-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stressData}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#4ECDC4" strokeWidth={2} fill="url(#stressGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
    return <Link to={createPageUrl("Stress")}>{CardInner}</Link>;
  }

  // Original layout for other cards
  const CardInner =
  <Card className={`bg-white rounded-2xl border-0 subtle-shadow w-full h-full ${fullWidth ? 'col-span-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{metric.icon}</span>
            <span className="text-sm text-gray-600">{metric.label}</span>
          </div>
          {metric.status &&
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {metric.status}
            </span>
        }
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              {metric.unit &&
            <span className="text-sm text-gray-500">{metric.unit}</span>
            }
            </div>
            {metric.subtitle &&
          <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
          }
          </div>

          <div className="flex-1 ml-4">
            {metric.chart && renderChart()}
          </div>
        </div>

        {metric.progress !== undefined &&
      <div className="mt-3">
            <Progress
          value={metric.progress}
          className="h-1.5"
          style={{
            backgroundColor: '#f3f4f6',
            '--progress-color': metric.color,
          }} />

          </div>
      }
      </CardContent>
    </Card>;


  // Make cards clickable based on their label
  if (metric.label === 'Water') {
    return <Link to={createPageUrl("Water")}>{CardInner}</Link>;
  }

  if (metric.label === 'Workouts') {
    return <Link to={createPageUrl("Workouts")}>{CardInner}</Link>;
  }

  if (metric.label === 'Running') {
    return <Link to={createPageUrl("Running")}>{CardInner}</Link>;
  }

  return CardInner;
}
