import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Check, Dna, User as UserIcon, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

// Import custom icons
import BloodDropIcon from "../icons/BloodDropIcon";
import DnaStrandIcon from "../icons/DnaStrandIcon";

export default function LabResultsCard({ orders }) {
  const [labResults, setLabResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unmatchedCount, setUnmatchedCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadLabResults();
  }, []);

  const loadLabResults = async () => {
    try {
      const user = await base44.auth.me().catch(() => ({ id: '', role: 'user' }));
      setCurrentUser(user);

      if (user.id) {
        // Admins see the latest results from everyone, users see their own.
        const userResults = user.role === 'admin'
            ? await base44.entities.LabResult.list('-test_date', 2)
            : await base44.entities.LabResult.filter({ user_id: user.id }, '-test_date', 2);
        
        setLabResults(userResults);

        // --- CRITICAL FIX ---
        // Background sync logic should ONLY run for admins to prevent data corruption for users.
        if (user.role === 'admin') {
            try {
              // Use the SDK to call the function instead of dynamic import
              const matchingResponse = await base44.functions.invoke('listBloodResults', {});
              if (matchingResponse.data?.success) {
                setUnmatchedCount(matchingResponse.data.unmatched_files || 0);
              }
            } catch (error) {
              console.error('Background matching failed for admin:', error);
              // Fail silently - this is just for the unmatched count badge
            }
        }
      }
    } catch (error) {
      console.error('Error loading lab results:', error);
      setLabResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTestIcon = (testType) => {
    switch (testType) {
      case 'blood_work':
        return BloodDropIcon;
      case 'genetics':
        return DnaStrandIcon;
      default:
        return BloodDropIcon;
    }
  };

  const getIconColors = (iconColor) => {
    switch (iconColor) {
      case 'red':
        return { iconColor: 'text-red-500', iconBg: 'bg-red-50' };
      case 'purple':
        return { iconColor: 'text-purple-500', iconBg: 'bg-purple-50' };
      case 'teal':
        return { iconColor: 'text-teal-500', iconBg: 'bg-teal-50' };
      case 'orange':
        return { iconColor: 'text-orange-500', iconBg: 'bg-orange-50' };
      case 'green':
        return { iconColor: 'text-green-500', iconBg: 'bg-green-50' };
      case 'blue':
        return { iconColor: 'text-blue-500', iconBg: 'bg-blue-50' };
      default:
        return { iconColor: 'text-gray-500', iconBg: 'bg-gray-50' };
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-[#E6F8F6] text-[#299C8F] border-0 hover:bg-[#E6F8F6]';
      case 'high':
        return 'bg-orange-50 text-orange-600 border-0 hover:bg-orange-50';
      case 'low':
        return 'bg-blue-50 text-blue-600 border-0 hover:bg-blue-50';
      case 'critical':
        return 'bg-red-50 text-red-600 border-0 hover:bg-red-50';
      default:
        return 'bg-[#E6F8F6] text-[#299C8F] border-0 hover:bg-[#E6F8F6]';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-3xl border-0 subtle-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-teal-500" />
              <span className="text-base font-medium text-gray-900">Lab Results</span>
            </div>
          </div>
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-2xl"></div>
            <div className="h-20 bg-gray-200 rounded-2xl"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-3xl border-0 subtle-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-teal-500" />
            <span className="text-base font-medium text-gray-900">Lab Results</span>
            {unmatchedCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                {unmatchedCount} pending
              </Badge>
            )}
          </div>
          <Link to={createPageUrl("LabResults")}>
            <div className="bg-[#F5FCFB] pr-3 pb-1 pl-3 rounded-full">
              <span className="text-sm text-[#41AAA3] font-medium hover:opacity-80 transition-opacity">View All</span>
            </div>
          </Link>
        </div>

        <div className="space-y-3">
          {labResults.length > 0 ? (
            labResults.map((result) => {
              const IconComponent = getTestIcon(result.test_type);
              const { iconColor, iconBg } = getIconColors(result.icon_color);
              
              // Determine the target page based on test type and available data
              let targetPage;
              if (result.profile_id) {
                targetPage = `MuhdoProfile?profile_id=${result.profile_id}&test_type=${result.test_type}`;
              } else if (result.test_type === 'blood_work') {
                // ANY blood work from a file goes to the detailed CBC page
                targetPage = `CompleteBloodCount?id=${result.id}`;
              } else {
                targetPage = `LabResultDetail?id=${result.id}`;
              }
              
              return (
                <Link to={createPageUrl(targetPage)} key={result.id}>
                  <div className="bg-white my-3 pt-6 pr-4 pb-4 pl-4 rounded-2xl border border-[#E9EAEA] subtle-shadow hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center`}>
                        <IconComponent className={`w-8 h-8 ${iconColor}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{result.test_name}</h4>
                        {/* Display User Name and Lab for Admins */}
                        {currentUser?.role === 'admin' && result.user_name && (
                           <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                               <div className="flex items-center gap-1.5">
                                   <UserIcon className="w-3.5 h-3.5" />
                                   <span className="font-medium">{result.user_name}</span>
                               </div>
                               <div className="flex items-center gap-1.5">
                                   <Building2 className="w-3.5 h-3.5" />
                                   <span>{result.laboratory || 'N/A'}</span>
                               </div>
                           </div>
                        )}
                        <p className="text-sm text-gray-500 my-2">
                          {new Date(result.test_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <Badge className={`${getStatusBadgeClass(result.status)} px-3 py-1 text-xs font-medium`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              );
            })
          ) : (
            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="text-center py-8">
                <Dna className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No lab results yet.</p>
                <p className="text-xs text-gray-400 mt-1">Order tests to see your results here.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6">
          <Link to={createPageUrl("Tests")}>
            <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl h-14 text-base font-medium">
              Order New Tests
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}