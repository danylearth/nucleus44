import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Upload,
  X
} from "lucide-react";

import HealthScoreArc from "../components/dashboard/HealthScoreArc";
import MetricCard from "../components/dashboard/MetricCard";
import SupplementsCard from "../components/dashboard/SupplementsCard";
import LabResultsCard from "../components/dashboard/LabResultsCard";
import BellIcon from "../components/icons/BellIcon";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import NutritionCard from "../components/dashboard/NutritionCard";

export default function Dashboard() {
  const [user, setUser] = useState({ health_score: 750, full_name: 'User', id: '', profile_picture: '' });
  const [healthData, setHealthData] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState('none');
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Memoize expensive data processing
  const processHealthDataToMetrics = useMemo(() => {
    return (healthDataForToday) => {
      console.log('🔍 Processing health data for metrics:', healthDataForToday);
      
      const metrics = {
        steps: { value: '0', unit: 'steps', progress: 0 },
        heartRate: { value: '0', unit: 'bpm', status: 'normal' },
        calories: { value: '0', unit: 'kcal', progress: 0 },
        sleep: { value: '0h', subtitle: '0m Deep' },
        stress: { value: '0', unit: 'HRV', subtitle: '0h 0m' },
        water: { value: '0', unit: 'glasses', progress: 0 },
        bloodPressure: { systolic: 0, diastolic: 0 },
        glucose: { average: 0 },
        temperature: { average: 0 },
        oxygen: { average: 0 }
      };
      
      // Process daily data
      const dailyData = healthDataForToday.find(item => item.data_type === 'daily');
      if (dailyData?.data) {
          console.log('📊 Daily data found:', dailyData.data);
          
          // STEPS - Terra sends steps in distance_data.steps
          const totalSteps = dailyData.data.distance_data?.steps || 0;
          if (totalSteps > 0) {
            metrics.steps.value = totalSteps.toString();
            metrics.steps.progress = Math.min((totalSteps / 10000) * 100, 100);
            console.log('👟 Steps:', metrics.steps.value);
          }
          
          // CALORIES - Terra sends calorie_samples array, need to sum them up
          const calorieSamples = dailyData.data.calories_data?.calorie_samples || [];
          const totalCaloriesSamples = dailyData.data.calories_data?.total_burned_calories; // Some providers send this
          
          let totalCalories = 0;
          if (totalCaloriesSamples) {
            // If total is provided directly
            totalCalories = totalCaloriesSamples;
          } else if (calorieSamples.length > 0) {
            // Sum up all calorie samples
            totalCalories = calorieSamples.reduce((sum, sample) => sum + (sample.calories || 0), 0);
          }
          
          if (totalCalories > 0) {
            metrics.calories.value = Math.round(totalCalories).toString();
            metrics.calories.progress = Math.min((totalCalories / 2000) * 100, 100);
            console.log('🔥 Calories:', metrics.calories.value, 'from', calorieSamples.length, 'samples');
          }
          
          // HEART RATE - DETAILED LOGGING
          console.log('🔍 Checking heart rate data structure (daily):', {
            has_heart_rate_data: !!dailyData.data.heart_rate_data,
            summary: dailyData.data.heart_rate_data?.summary,
            samples_count: dailyData.data.heart_rate_data?.samples?.length || 0,
            full_hr_data: JSON.stringify(dailyData.data.heart_rate_data, null, 2)
          });

          let avgHr = dailyData.data.heart_rate_data?.summary?.avg_hr_bpm || 0;
          
          // If no summary, calculate from samples
          if (avgHr === 0 && dailyData.data.heart_rate_data?.samples?.length > 0) {
            const samples = dailyData.data.heart_rate_data.samples;
            const sum = samples.reduce((acc, s) => acc + (s.bpm || 0), 0);
            avgHr = Math.round(sum / samples.length);
            console.log('❤️ Heart Rate calculated from', samples.length, 'samples:', avgHr);
          }
          
          console.log('❤️ Heart Rate (daily):', avgHr, 'Full HR data:', dailyData.data.heart_rate_data);
          
          if (avgHr > 0) {
            metrics.heartRate.value = Math.round(avgHr).toString();
            metrics.heartRate.status = (avgHr > 60 && avgHr < 100) ? 'normal' : 'elevated';
            console.log('✅ Heart Rate set:', metrics.heartRate.value, 'bpm');
          }
          
          // OXYGEN
          const avgO2 = dailyData.data.oxygen_data?.avg_saturation_percentage || 0;
          if (avgO2 > 0) {
            metrics.oxygen.average = Math.round(avgO2);
          } else if (dailyData.data.oxygen_data?.saturation_samples?.length > 0) {
            const samples = dailyData.data.oxygen_data.saturation_samples;
            const sum = samples.reduce((acc, s) => acc + (s.percentage || 0), 0);
            metrics.oxygen.average = Math.round(sum / samples.length);
          }
          
          // HRV for stress
          const hrvValue = dailyData.data.heart_rate_data?.summary?.avg_hrv_rmssd || 0;
          if (hrvValue > 0) {
            metrics.stress.value = Math.round(hrvValue).toString();
          }
      }

      // Process body data
      const bodyData = healthDataForToday.find(item => item.data_type === 'body');
      if (bodyData?.data) {
          console.log('🏋️ Body data found:', bodyData.data);
          
          // Heart Rate from body data (if not already set)
          if (metrics.heartRate.value === '0') {
            console.log('🔍 Checking body heart rate:', {
              has_heart_data: !!bodyData.data.heart_data,
              has_hr_data: !!bodyData.data.heart_data?.heart_rate_data,
              summary: bodyData.data.heart_data?.heart_rate_data?.summary,
              samples_count: bodyData.data.heart_data?.heart_rate_data?.samples?.length || 0,
              full_hr_data: JSON.stringify(bodyData.data.heart_data?.heart_rate_data, null, 2)
            });
            
            const hrSummary = bodyData.data.heart_data?.heart_rate_data?.summary;
            let bodyAvgHr = hrSummary?.avg_hr_bpm || 0;
            
            // Try samples if no summary
            if (bodyAvgHr === 0 && bodyData.data.heart_data?.heart_rate_data?.samples?.length > 0) {
              const samples = bodyData.data.heart_data.heart_rate_data.samples;
              const sum = samples.reduce((acc, s) => acc + (s.bpm || 0), 0);
              bodyAvgHr = Math.round(sum / samples.length);
            }
            
            console.log('❤️ Heart Rate (body):', bodyAvgHr, 'Full HR data:', bodyData.data.heart_data);
            
            if (bodyAvgHr > 0) {
              metrics.heartRate.value = Math.round(bodyAvgHr).toString();
              metrics.heartRate.status = (bodyAvgHr > 60 && bodyAvgHr < 100) ? 'normal' : 'elevated';
              console.log('✅ Heart Rate set from body:', metrics.heartRate.value, 'bpm');
            }
          }

          // Blood Pressure
          const bpSamples = bodyData.data.blood_pressure_data?.blood_pressure_samples;
          if (bpSamples && bpSamples.length > 0) {
            const latestBP = bpSamples[0];
            metrics.bloodPressure.systolic = Math.round(latestBP.systolic_bp || 0);
            metrics.bloodPressure.diastolic = Math.round(latestBP.diastolic_bp || 0);
          }

          // Glucose
          const avgGlucose = bodyData.data.glucose_data?.day_avg_blood_glucose_mg_per_dL || 0;
          if (avgGlucose > 0) {
            metrics.glucose.average = Math.round(avgGlucose);
          } else if (bodyData.data.glucose_data?.blood_glucose_samples?.length > 0) {
            const samples = bodyData.data.glucose_data.blood_glucose_samples;
            const sum = samples.reduce((acc, s) => acc + (s.glucose_mg_per_dL || 0), 0);
            metrics.glucose.average = Math.round(sum / samples.length);
          }

          // Temperature
          const tempSamples = bodyData.data.temperature_data?.body_temperature_samples;
          if (tempSamples && tempSamples.length > 0) {
            const avgTemp = tempSamples.reduce((sum, sample) => sum + (sample.temperature_celsius || 0), 0) / tempSamples.length;
            if (avgTemp > 0) {
              metrics.temperature.average = avgTemp.toFixed(1);
            }
          }
          
          // Oxygen fallback
          if (metrics.oxygen.average === 0) {
            const bodyO2 = bodyData.data.oxygen_data?.avg_saturation_percentage || 0;
            if (bodyO2 > 0) {
              metrics.oxygen.average = Math.round(bodyO2);
            } else if (bodyData.data.oxygen_data?.saturation_samples?.length > 0) {
              const samples = bodyData.data.oxygen_data.saturation_samples;
              const sum = samples.reduce((acc, s) => acc + (s.percentage || 0), 0);
              metrics.oxygen.average = Math.round(sum / samples.length);
            }
          }
      }

      // Process activity data
      const activityData = healthDataForToday.filter(item => item.data_type === 'activity');
      if (activityData.length > 0) {
          console.log('🏃 Activity data found:', activityData.length, 'activities');
          
          // Sum calories from all activities if daily doesn't have it
          if (metrics.calories.value === '0') {
            let totalActivityCalories = 0;
            activityData.forEach(activity => {
              const activityTotal = activity.data.calories_data?.total_burned_calories || 0;
              const activitySamples = activity.data.calories_data?.calorie_samples || [];
              
              if (activityTotal > 0) {
                totalActivityCalories += activityTotal;
              } else if (activitySamples.length > 0) {
                totalActivityCalories += activitySamples.reduce((sum, s) => sum + (s.calories || 0), 0);
              }
            });
            
            if (totalActivityCalories > 0) {
              metrics.calories.value = Math.round(totalActivityCalories).toString();
              metrics.calories.progress = Math.min((totalActivityCalories / 2000) * 100, 100);
              console.log('🔥 Calories from activities:', metrics.calories.value);
            }
          }

          // Sum steps from all activities if daily doesn't have it
          if (metrics.steps.value === '0') {
            const totalActivitySteps = activityData.reduce((sum, activity) => {
              return sum + (activity.data.distance_data?.steps || 0);
            }, 0);
            
            if (totalActivitySteps > 0) {
              metrics.steps.value = totalActivitySteps.toString();
              metrics.steps.progress = Math.min((totalActivitySteps / 10000) * 100, 100);
              console.log('👟 Steps from activities:', metrics.steps.value);
            }
          }

          // Heart rate from activities if still not set
          if (metrics.heartRate.value === '0' || parseInt(metrics.heartRate.value) < 50) {
            const latestActivity = activityData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
            console.log('🔍 Checking activity heart rate:', {
              activity_name: latestActivity?.data?.metadata?.name,
              has_hr_data: !!latestActivity?.data?.heart_rate_data,
              summary: latestActivity?.data?.heart_rate_data?.summary,
              samples_count: latestActivity?.data?.heart_rate_data?.samples?.length || 0,
              full_hr_data: JSON.stringify(latestActivity?.data?.heart_rate_data, null, 2)
            });
            
            let activityHr = latestActivity?.data?.heart_rate_data?.summary?.avg_hr_bpm || 0;
            
            if (activityHr === 0 && latestActivity?.data?.heart_rate_data?.samples?.length > 0) {
              const samples = latestActivity.data.heart_rate_data.samples;
              const sum = samples.reduce((acc, s) => acc + (s.bpm || 0), 0);
              activityHr = Math.round(sum / samples.length);
            }
            
            console.log('❤️ Heart Rate (activity):', activityHr, 'Full HR data:', latestActivity?.data?.heart_rate_data);
            
            if (activityHr > 0) {
              metrics.heartRate.value = Math.round(activityHr).toString();
              metrics.heartRate.status = (activityHr > 60 && activityHr < 100) ? 'normal' : 'elevated';
              console.log('✅ Heart Rate set from activity:', metrics.heartRate.value, 'bpm');
            }
          }
      }
      
      // Process sleep data
      const sleepData = healthDataForToday.find(item => item.data_type === 'sleep');
      if (sleepData?.data?.sleep_durations_data?.asleep) {
          const duration = sleepData.data.sleep_durations_data.asleep.duration_asleep_state_seconds || 0;
          if (duration > 0) {
            const hours = Math.floor(duration / 3600);
            const minutes = Math.floor((duration % 3600) / 60);
            metrics.sleep.value = `${hours}h`;
            metrics.sleep.subtitle = `${minutes}m Deep`;
            console.log('😴 Sleep:', metrics.sleep.value, metrics.sleep.subtitle);
          }
      }

      console.log('✅ Final metrics:', metrics);
      console.log('❤️ Final Heart Rate:', metrics.heartRate);

      return [
        { icon: '👟', label: 'Steps', value: metrics.steps.value, unit: metrics.steps.unit, progress: metrics.steps.progress, color: 'bg-cyan-500' },
        { icon: '❤️', label: 'Heart Rate', value: metrics.heartRate.value, unit: metrics.heartRate.unit, status: metrics.heartRate.status, chart: 'heart', color: 'bg-red-500' },
        { icon: '🔥', label: 'Calories', value: metrics.calories.value, unit: metrics.calories.unit, progress: metrics.calories.progress, color: 'bg-orange-500' },
        { icon: '🩸', label: 'Blood Pressure', value: metrics.bloodPressure.systolic === 0 ? 'N/A' : `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic}`, unit: 'mmHg', color: 'bg-red-400' },
        { icon: '🍬', label: 'Glucose', value: metrics.glucose.average === 0 ? 'N/A' : metrics.glucose.average.toString(), unit: 'mg/dL', color: 'bg-purple-500' },
        { icon: '🌡️', label: 'Temperature', value: metrics.temperature.average === 0 ? 'N/A' : metrics.temperature.average.toString(), unit: '°C', color: 'bg-orange-400' },
        { icon: '🫁', label: 'Oxygen', value: metrics.oxygen.average === 0 ? 'N/A' : `${metrics.oxygen.average}%`, unit: 'SpO2', color: 'bg-blue-400' },
        { icon: '😴', label: 'Sleep', value: metrics.sleep.value, subtitle: metrics.sleep.subtitle, chart: 'sleep_bar', color: 'bg-purple-500' },
        { icon: '🧘', label: 'Stress', value: metrics.stress.value, unit: metrics.stress.unit, subtitle: metrics.stress.subtitle, chart: 'stress_area', color: 'bg-green-500' },
        { icon: '💧', label: 'Water', value: metrics.water.value, unit: metrics.water.unit, progress: metrics.water.progress, color: 'bg-blue-500' }
      ];
    };
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser?.id) {
        const userRecords = await base44.entities.HealthData.filter(
          { user_id: currentUser.id }, 
          '-synced_at',
          50
        );
        
        console.log('📦 Total records fetched:', userRecords.length);
        
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        
        const todayRecords = userRecords.filter(record => {
          if (!record.synced_at) return false;
          const syncDate = record.synced_at.split('T')[0];
          return syncDate === today;
        });
        
        console.log(`📅 Found ${todayRecords.length} records for today (${today})`);
        
        let recordsToProcess = todayRecords;
        let dateUsed = today;
        
        if (todayRecords.length === 0) {
          const yesterdayRecords = userRecords.filter(record => {
            if (!record.synced_at) return false;
            const syncDate = record.synced_at.split('T')[0];
            return syncDate === yesterdayStr;
          });
          
          console.log(`📅 Using yesterday's data (${yesterdayStr}): ${yesterdayRecords.length} records`);
          recordsToProcess = yesterdayRecords;
          dateUsed = yesterdayStr;
        }
        
        if (recordsToProcess.length > 0) {
          const latestByType = {};
          recordsToProcess.forEach(record => {
            const type = record.data_type;
            
            if (!latestByType[type]) {
              latestByType[type] = record;
            } else {
              const currentSyncTime = new Date(latestByType[type].synced_at);
              const newSyncTime = new Date(record.synced_at);
              
              if (newSyncTime > currentSyncTime) {
                latestByType[type] = record;
              }
            }
          });
          
          const latestRecords = Object.values(latestByType);
          
          console.log(`🎯 Processing ${latestRecords.length} latest records by type`);
          latestRecords.forEach(r => {
            console.log(`  - ${r.data_type}: synced at ${r.synced_at}`);
          });
          
          const nutritionEntries = latestRecords.filter(item => item.data_type === 'nutrition');
          const processedMetrics = processHealthDataToMetrics(latestRecords);
          const nutrition = nutritionEntries.length > 0 && nutritionEntries[0].data.summary ? nutritionEntries[0].data.summary : null;
          
          setHealthData(latestRecords);
          setDataSource(dateUsed === today ? 'real' : 'yesterday');
          setMetricsData(processedMetrics);
          setNutritionData(nutrition);
        } else {
          console.log('❌ No health data found for today or yesterday');
          setDataSource('none');
          setMetricsData([]);
          setNutritionData(null);
        }
      } else {
        setDataSource('none');
        setMetricsData([]);
        setNutritionData(null);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      setDataSource('none');
      setMetricsData([]);
      setNutritionData(null);
    } finally {
      setIsLoading(false);
    }
  }, [processHealthDataToMetrics]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const healthScore = user?.health_score || 750;
  const firstName = user?.full_name?.split(' ')[0] || 'User';
  const profilePicture = user?.profile_picture || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c5c2121d3e86e4be58e018/be300faf8_92e43541-1304-4687-9e2f-3617bacf279e1.png';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8F8' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-8">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl("Profile")} className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Good morning</p>
              <h1 className="text-3xl font-bold text-gray-900">{firstName}</h1>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center shadow-sm">
              <BellIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-24">
        <HealthScoreArc score={healthScore} />

        {/* Image Upload Section */}
        {/* <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Health Image</h3>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-gray-900 hover:bg-gray-800 text-white"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {uploadedImage && (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded health image"
                  className="w-full rounded-xl object-cover max-h-64"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {!uploadedImage && !isUploading && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No image uploaded yet</p>
              </div>
            )}

            {isUploading && (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Uploading image...</p>
              </div>
            )}
          </CardContent>
        </Card> */}
        
        {/* Show error message if there's an error */}
        {error && (
          <Card className="bg-red-50 rounded-2xl border-red-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-700 text-sm mb-4">{error}</p>
              <Button onClick={loadDashboardData} className="bg-red-600 hover:bg-red-700 text-white">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Show placeholder if no data */}
        {!error && dataSource === 'none' ? (
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Health Data Yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Connect your wearable device or mobile app to start tracking your health metrics.
              </p>
              <Link to={createPageUrl("Devices")}>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Connect Device
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : !error && (
          <>
            {/* Show metrics if we have data */}
            <div className="grid grid-cols-3 gap-4 items-start">
                <div className="col-span-1 flex flex-col gap-4">
                    <MetricCard metric={metricsData.find(m => m.label === 'Steps')} />
                    <MetricCard metric={metricsData.find(m => m.label === 'Calories')} />
                </div>
                <div className="col-span-2">
                    <MetricCard metric={metricsData.find(m => m.label === 'Heart Rate')} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <MetricCard metric={metricsData.find(m => m.label === 'Sleep')} />
                <MetricCard metric={metricsData.find(m => m.label === 'Stress')} />
            </div>
            
            {nutritionData && (
              <div className="mt-6">
                <NutritionCard nutritionData={nutritionData} />
              </div>
            )}
          </>
        )}
        
        <div className="mt-6">
          <SupplementsCard />
        </div>
        <div className="mt-6">
          <LabResultsCard />
        </div>
      </div>
    </div>
  );
}