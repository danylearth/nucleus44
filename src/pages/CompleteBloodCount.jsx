import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Download,
  Eye,
  Share2,
  Calendar,
  Building2,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Circle,
  Loader2,
  MessageCircle
} from "lucide-react";
import { LabResult, LabResultParameter } from "@/entities/all";
import { format } from "date-fns";
import { downloadBloodResult } from "@/functions/downloadBloodResult";

export default function CompleteBloodCountPage() {
  const [result, setResult] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const location = useLocation();


  useEffect(() => {
    const loadResultDetails = async (resultId) => {
      setIsLoading(true);
      try {
        const [resultData, paramsData] = await Promise.all([
          LabResult.get(resultId),
          LabResultParameter.filter({ lab_result_id: resultId })
        ]);
        setResult(resultData);
        // We will now ONLY use the real data from the database.
        setParameters(paramsData);
        console.log('Found parameters:', paramsData);
      } catch (error) {
        console.error("Error loading CBC details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const searchParams = new URLSearchParams(location.search);
    const resultId = searchParams.get('id');
    if (resultId) {
      loadResultDetails(resultId);
    } else {
      setIsLoading(false);
    }
  }, [location.search]);

  const handleDownloadOriginal = async () => {
    if (!result?.blood_result_filename) return;
    setIsDownloading(true);
    try {
      const response = await downloadBloodResult({ filename: result.blood_result_filename, action: 'download' });
      // Assuming response.data is an ArrayBuffer or similar for Blob
      const blob = new Blob([response.data], { type: 'text/plain' }); // Using text/plain as per outline
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.blood_result_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(`Failed to download file: ${err.message}`);
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewOriginal = async () => {
    if (!result?.blood_result_filename) return;
    setIsViewing(true);
    try {
      const response = await downloadBloodResult({ filename: result.blood_result_filename, action: 'view' });
      // Assuming response.data can be a string or an ArrayBuffer
      const text = typeof response.data === 'string' ? response.data : new TextDecoder().decode(response.data);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${text}</pre>`);
        newWindow.document.title = result.blood_result_filename;
        newWindow.document.close(); // Important for some browsers
      } else {
        alert("Pop-up blocked! Please allow pop-ups for this site to view the report.");
      }
    } catch (err) {
      alert(`Failed to view file: ${err.message}`);
      console.error("View error:", err);
    } finally {
      setIsViewing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'high':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: 'text-orange-500',
          trafficLight: 'bg-yellow-400'
        };
      case 'low':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          trafficLight: 'bg-yellow-400'
        };
      case 'critical':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: 'text-red-500',
          trafficLight: 'bg-red-500'
        };
      case 'normal':
      default:
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: 'text-green-500',
          trafficLight: 'bg-green-500'
        };
    }
  };

  const getStatusIcon = (status) => {
    const colors = getStatusColor(status);
    if (status === 'normal') {
      return <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />;
    }
    return <AlertCircle className={`w-5 h-5 ${colors.icon}`} />;
  };

  const getProgressBarWidth = (value, range) => {
        const rangeStr = range.trim();
        const numValue = parseFloat(value);

        if (rangeStr.startsWith('<')) {
          const max = parseFloat(rangeStr.replace('<', '').trim());
          if (isNaN(max) || isNaN(numValue)) return 50;
          // Scale so max is at 50%, values above go to 100%
          const percentage = (numValue / (max * 2)) * 100;
          return Math.max(0, Math.min(100, percentage));
        }

        if (rangeStr.startsWith('>')) {
          const min = parseFloat(rangeStr.replace('>', '').trim());
          if (isNaN(min) || isNaN(numValue)) return 50;
          // Scale so min is at 50%
          const percentage = (numValue / (min * 2)) * 100;
          return Math.max(0, Math.min(100, percentage));
        }

        const [min, max] = rangeStr.split('-').map(s => parseFloat(s.trim()));
        if (isNaN(min) || isNaN(max) || isNaN(numValue)) return 50;

        // Calculate the range midpoint and scale so it's at 50%
        const rangeSize = max - min;
        const midpoint = min + (rangeSize / 2);

        // Scale: midpoint = 50%, min = 25%, max = 75%
        // Values below min go towards 0%, values above max go towards 100%
        const normalizedValue = (numValue - midpoint) / rangeSize;
        const percentage = 50 + (normalizedValue * 50);

        return Math.max(0, Math.min(100, percentage));
      };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen animate-pulse p-4 pt-12">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-40 bg-gray-200 rounded-2xl mb-8"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold mb-2">Result Not Found</h2>
        <p className="text-gray-600 mb-4">The lab result you are looking for does not exist.</p>
        <Link to={createPageUrl("LabResults")}>
          <Button>Back to All Results</Button>
        </Link>
      </div>
    );
  }

  const overallStatus = getStatusColor(result.status);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-red-500 to-red-600 text-white p-6 pt-12 pb-32">
        <div className="flex items-center justify-between mb-8">
          <Link to={createPageUrl(new URLSearchParams(location.search).get('from') || "LabResults")} className="p-2 -ml-2">
                          <ChevronLeft className="w-6 h-6" />
                        </Link>
          <h1 className="text-lg font-semibold">Blood Test</h1>
          <div className="flex items-center gap-2">
            {result?.blood_result_filename && (
              <>
                <Button variant="ghost" size="icon" className="text-white bg-white/20 hover:bg-white/30" onClick={handleViewOriginal} disabled={isViewing}>
                  {isViewing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-white bg-white/20 hover:bg-white/30" onClick={handleDownloadOriginal} disabled={isDownloading}>
                  {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                </Button>
              </>
            )}
            <button className="p-2 bg-white/20 rounded-full">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{result.test_name}</h2>
          <p className="text-white/80 text-sm">
            {format(new Date(result.test_date), 'MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-20 space-y-4">
        {/* Overall Status Card */}
        <Card className={`rounded-2xl border-2 ${overallStatus.border} ${overallStatus.bg}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${overallStatus.bg}`}>
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${overallStatus.text}`}>
                  {result.status === 'normal' ? 'All Results Normal' :
                    result.status === 'high' || result.status === 'low' ? 'Review Needed' :
                      'Immediate Attention Required'}
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  {result.results_summary || 'Your test results have been processed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Information */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Ordered by</p>
                <p className="font-medium text-gray-900">{result.ordered_by || 'Dr. Sarah Johnson'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Laboratory</p>
                <p className="font-medium text-gray-900">{result.laboratory || 'LabCorp'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Test Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(result.test_date), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parameters Section - THIS IS THE DETAILED REPORT */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Test Parameters ({parameters.length})</h3>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              🚦 Traffic Light System
            </Badge>
          </div>

          <div className="space-y-3">
            {parameters.map((param, index) => {
                                // Dynamically calculate status based on value vs reference range
                                const calculateStatus = (value, range) => {
                                  const numValue = parseFloat(value);
                                  const rangeStr = (range || '').trim();

                                  if (isNaN(numValue) || !rangeStr) return param.status || 'normal';

                                  if (rangeStr.startsWith('<')) {
                                    const max = parseFloat(rangeStr.replace('<', '').trim());
                                    if (!isNaN(max)) {
                                      if (numValue > max * 2) return 'critical';
                                      if (numValue > max) return 'high';
                                    }
                                    return 'normal';
                                  }

                                  if (rangeStr.startsWith('>')) {
                                    const min = parseFloat(rangeStr.replace('>', '').trim());
                                    if (!isNaN(min)) {
                                      if (numValue < min / 2) return 'critical';
                                      if (numValue < min) return 'low';
                                    }
                                    return 'normal';
                                  }

                                  const [min, max] = rangeStr.split('-').map(s => parseFloat(s.trim()));
                                  if (isNaN(min) || isNaN(max)) return param.status || 'normal';

                                  const rangeSize = max - min;
                                  if (numValue < min - rangeSize) return 'critical';
                                  if (numValue > max + rangeSize) return 'critical';
                                  if (numValue < min) return 'low';
                                  if (numValue > max) return 'high';
                                  return 'normal';
                                };

                                const calculatedStatus = calculateStatus(param.value, param.reference_range);
                                const status = getStatusColor(calculatedStatus);
                                const progressWidth = getProgressBarWidth(param.value, param.reference_range);

              return (
                <Card key={index} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Traffic Light Indicator */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(calculatedStatus).trafficLight} shadow-lg`}></div>
                        <div className="w-0.5 h-full bg-gray-200"></div>
                      </div>

                      {/* Parameter Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{param.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                          </div>
                          <Badge className={`${status.bg} ${status.text} border-0 ml-2 whitespace-nowrap`}>
                                                            {calculatedStatus === 'normal' ? '✓ Normal' :
                                                              calculatedStatus === 'high' ? '↑ High' :
                                                                calculatedStatus === 'low' ? '↓ Low' :
                                                                  '⚠ Critical'}
                          </Badge>
                        </div>

                        {/* Value and Range */}
                        <div className="flex items-center gap-2 mt-3">
                          <div className={`text-2xl font-bold ${getStatusColor(calculatedStatus).text}`}>
                            {param.value}
                          </div>
                          <div className="text-sm text-gray-500">
                            {param.unit}
                          </div>
                        </div>

                        {/* Progress Bar */}
                                                      <div className="mt-3">
                                                        <div className="relative w-full h-3">
                                                          {/* Background track */}
                                                          <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                                                          {/* Expected Range Zone - green area in the middle */}
                                                          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-green-200 rounded-full"></div>
                                                          {/* Expected Range boundary markers - top and bottom */}
                                                          <div className="absolute left-1/4 w-0.5 h-5 bg-green-500 -top-1"></div>
                                                          <div className="absolute left-3/4 w-0.5 h-5 bg-green-500 -top-1"></div>
                                                          {/* Value indicator dot */}
                                                          <div 
                                                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${getStatusColor(calculatedStatus).trafficLight} border-2 border-white shadow-md transition-all duration-500`}
                                                            style={{ left: `calc(${progressWidth}% - 8px)` }}
                                                          ></div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                          <span className="text-xs text-gray-500">Expected Range</span>
                                                          <span className="text-xs font-medium text-gray-700">{param.reference_range}</span>
                                                        </div>
                                                      </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={handleDownloadOriginal}
            disabled={isDownloading || !result?.blood_result_filename}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download Report
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Share2 className="w-4 h-4" />
            Share Results
          </Button>
        </div>

        {/* Chat with AI Button */}
        <Link
          to={createPageUrl(`AIAgent?context=${encodeURIComponent(JSON.stringify({
            type: 'lab_results',
            test_name: result.test_name,
            test_date: result.test_date,
            status: result.status,
            parameters: parameters.map(p => ({
              name: p.name,
              value: p.value,
              unit: p.unit,
              status: p.status,
              reference_range: p.reference_range
            }))
          }))}`)}
          className="block mt-6"
        >
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl h-14 text-base font-medium shadow-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat with AI about these results
          </Button>
        </Link>
      </div>
    </div>
  );
}