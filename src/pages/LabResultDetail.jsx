
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Download,
  Eye, // Added Eye icon
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Loader2 // Added Loader2 icon
} from "lucide-react";
import { LabResult, LabResultParameter } from "@/entities/all";
import { format } from "date-fns";
import { downloadBloodResult } from "@/functions/downloadBloodResult"; // Added import for downloadBloodResult

export default function LabResultDetailPage() {
  const [result, setResult] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false); // New state for download loading
  const [isViewing, setIsViewing] = useState(false); // New state for view loading
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resultId = searchParams.get('id');
    if (resultId) {
      loadResultDetails(resultId);
    } else {
      setIsLoading(false);
    }
  }, [location.search]);

  const loadResultDetails = async (resultId) => {
    setIsLoading(true);
    try {
      const [resultData, paramsData] = await Promise.all([
        LabResult.get(resultId),
        LabResultParameter.filter({ lab_result_id: resultId })
      ]);
      setResult(resultData);
      setParameters(paramsData);
    } catch (error) {
      console.error("Error loading result details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadOriginal = async () => {
    if (!result?.blood_result_filename) return;
    setIsDownloading(true);
    try {
      const response = await downloadBloodResult({ filename: result.blood_result_filename, action: 'download' });
      // Assuming response.data is a Blob or ArrayBuffer
      const blob = new Blob([response.data], { type: 'application/octet-stream' }); // Use a generic octet-stream type
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.blood_result_filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Failed to download file:", err);
      alert(`Failed to download file: ${err.message || "An unknown error occurred"}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewOriginal = async () => {
    if (!result?.blood_result_filename) return;
    setIsViewing(true);
    try {
      const response = await downloadBloodResult({ filename: result.blood_result_filename, action: 'view' });
      const text = typeof response.data === 'string' ? response.data : new TextDecoder().decode(response.data);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<pre style="word-wrap: break-word; white-space: pre-wrap;">${text}</pre>`);
        newWindow.document.title = result.blood_result_filename;
      } else {
        alert("Failed to open new window. Please allow pop-ups for this site.");
      }
    } catch (err) {
      console.error("Failed to view file:", err);
      alert(`Failed to view file: ${err.message || "An unknown error occurred"}`);
    } finally {
      setIsViewing(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'high': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status) => {
    const iconProps = { className: "w-6 h-6" };
    switch (status) {
      case 'high':
      case 'low':
      case 'critical':
        return <AlertCircle {...iconProps} style={{color: '#f59e0b'}} />;
      case 'normal':
      default:
        return <CheckCircle2 {...iconProps} className="text-green-500" />;
    }
  };
  
  const getOverallStatusIcon = (status) => {
    if(status !== 'normal') {
      return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100">
           <AlertCircle className="w-6 h-6 text-yellow-500" />
        </div>
      );
    }
    return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
           <CheckCircle2 className="w-6 h-6 text-green-500" />
        </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen animate-pulse p-4 pt-12">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-40 bg-gray-200 rounded-2xl mb-8"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
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

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("LabResults")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 truncate px-2">{result.test_name}</h1>
        <div className="flex items-center gap-2">
          {result.blood_result_filename && (
            <>
              <Button variant="ghost" size="icon" onClick={handleViewOriginal} disabled={isViewing}>
                {isViewing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5 text-gray-900" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDownloadOriginal} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 text-gray-900" />}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 space-y-8">
        {/* Summary Card */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {getOverallStatusIcon(result.status)}
                <div>
                  <h2 className="font-bold text-lg text-gray-900">{result.test_name}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(result.test_date), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <Badge className={`${getStatusBadgeStyle(result.status)} text-sm`}>
                {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ordered by:</span>
                <span className="font-medium text-gray-800">{result.ordered_by || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Laboratory:</span>
                <span className="font-medium text-gray-800">{result.laboratory || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium text-gray-800">{result.test_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parameters */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
          <div className="space-y-4">
            {parameters.map((param) => (
              <Card key={param.id} className="bg-white rounded-2xl border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(param.status)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{param.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 max-w-xs">{param.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                            {param.value}
                            <span className="text-base font-normal text-gray-500">{param.unit}</span>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          </p>
                          <Badge className={`${getStatusBadgeStyle(param.status)} mt-1`}>
                            {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="bg-gray-100 rounded-lg p-2 text-center text-sm">
                          <span className="text-gray-500">Reference Range: </span>
                          <span className="font-medium text-gray-800">{param.reference_range}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
