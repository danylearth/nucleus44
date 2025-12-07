import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function LabResultsTablePage() {
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllResults();
  }, []);

  const loadAllResults = async () => {
    try {
      setIsLoading(true);
      const user = await base44.auth.me();
      
      if (user.role !== 'admin') {
        window.location.href = createPageUrl('Dashboard');
        return;
      }

      const allResults = await base44.entities.LabResult.filter({}, '-created_date');
      setResults(allResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = results.filter(result => 
    searchQuery.trim() === '' || 
    Object.values(result).some(val => 
      val && String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const exportToCSV = () => {
    const headers = [
      'ID', 'User ID', 'User Name', 'Test Name', 'Test Type', 'Test Date',
      'Status', 'Approval Status', 'Icon Color', 'Results Summary', 
      'Ordered By', 'Laboratory', 'Profile ID', 'Algorithm Set', 
      'Blood Result File', 'Rejection Reason', 'Created Date', 'Created By'
    ];

    const rows = filteredResults.map(r => [
      r.id,
      r.user_id || '',
      r.user_name || '',
      r.test_name || '',
      r.test_type || '',
      r.test_date || '',
      r.status || '',
      r.approval_status || '',
      r.icon_color || '',
      r.results_summary || '',
      r.ordered_by || '',
      r.laboratory || '',
      r.profile_id || '',
      r.algorithm_set_reference_code || '',
      r.blood_result_filename || '',
      r.rejection_reason || '',
      r.created_date || '',
      r.created_by || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab_results_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 pt-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="p-4 pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Admin")} className="p-2">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">All Lab Results Data</h1>
          </div>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search all fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl h-12"
            />
          </div>
        </div>

        <p className="text-gray-600 mb-4">{filteredResults.length} total results</p>

        {/* Table */}
        <Card className="bg-white rounded-2xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">User ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">User Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Test Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Test Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Test Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Approval</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Results Summary</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Ordered By</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Laboratory</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Profile ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Algorithm Set</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Blood File</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Rejection Reason</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{result.id.slice(-8)}</td>
                      <td className="px-4 py-3 text-xs font-mono">{result.user_id === 'UNMATCHED' ? <Badge variant="outline" className="bg-red-50 text-red-600">UNMATCHED</Badge> : result.user_id?.slice(-8) || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{result.user_name || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{result.test_name || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline">{result.test_type || '-'}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{result.test_date ? format(new Date(result.test_date), 'MMM d, yyyy') : '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={
                          result.status === 'normal' ? 'bg-green-100 text-green-700' :
                          result.status === 'abnormal' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }>{result.status || '-'}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={
                          result.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                          result.approval_status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>{result.approval_status || '-'}</Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-gray-600" title={result.results_summary}>{result.results_summary || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{result.ordered_by || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{result.laboratory || '-'}</td>
                      <td className="px-4 py-3 text-xs font-mono">{result.profile_id || '-'}</td>
                      <td className="px-4 py-3 text-xs">{result.algorithm_set_reference_code || '-'}</td>
                      <td className="px-4 py-3 text-xs font-mono">{result.blood_result_filename || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{result.rejection_reason || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{result.created_date ? format(new Date(result.created_date), 'MMM d, yyyy HH:mm') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredResults.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}