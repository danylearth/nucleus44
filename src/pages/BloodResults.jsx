import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Search,
  ChevronRight,
  FileText,
  Calendar,
  AlertCircle,
  User as UserIcon,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

export default function BloodResultsPage() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBloodResults();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = results.filter(result => 
        result.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user?.role === 'admin' && result.user_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user?.role === 'admin' && result.laboratory?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(results);
    }
  }, [results, searchQuery, user]);

  const loadBloodResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // ✅ OPTIMIZED: Fetch directly from database
      // Admins see all blood work, users see only their own
      // Users only see approved results, admins see all
      const query = currentUser.role === 'admin' 
        ? { test_type: 'blood_work' }
        : { user_id: currentUser.id, test_type: 'blood_work', approval_status: 'approved' };
      
      const bloodResults = await base44.entities.LabResult.filter(query, '-test_date');
      setResults(bloodResults);
      console.log('✅ Loaded', bloodResults.length, 'blood test results from database');
    } catch (err) {
      console.error('Error loading blood results:', err);
      setError('Failed to load blood test results');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-600';
      case 'high':
        return 'bg-orange-100 text-orange-600';
      case 'low':
        return 'bg-blue-100 text-blue-600';
      case 'critical':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Blood Test Results</h1>
        <div className="w-10"></div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={user?.role === 'admin' ? "Search by patient, lab, or test..." : "Search test results..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 rounded-xl h-12"
          />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Blood Test Results</h2>
          <p className="text-gray-500 text-sm mb-4">{filteredResults.length} test{filteredResults.length !== 1 ? 's' : ''} found</p>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <Link key={result.id} to={createPageUrl(`CompleteBloodCount?id=${result.id}`)}>
                <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{result.test_name}</h3>
                        {user?.role === 'admin' && result.user_name && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
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
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(result.test_date), 'MMMM d, yyyy')}
                        </div>
                        <Badge className={`${getStatusColor(result.status)} text-xs font-medium`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No blood test results found</h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Your blood test results will appear here once processed'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}