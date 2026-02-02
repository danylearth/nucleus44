import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Search,
  FileText,
  Calendar,
  User as UserIcon,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

export default function BloodTestManagementPage() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (currentUser.role !== 'admin') {
        window.location.href = createPageUrl('Dashboard');
        return;
      }

      const allResults = await base44.entities.LabResult.list(
        '-created_date',
        1000
      );
      setResults(allResults);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (result) => {
    setIsUpdating(result.id);
    try {
      await base44.entities.LabResult.update(result.id, {
        approval_status: 'approved'
      });
      setResults(prev => prev.map(r => 
        r.id === result.id ? { ...r, approval_status: 'approved' } : r
      ));
    } catch (err) {
      console.error('Error approving result:', err);
      alert('Failed to approve result');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReject = async () => {
    if (!selectedResult) return;
    setIsUpdating(selectedResult.id);
    try {
      await base44.entities.LabResult.update(selectedResult.id, {
        approval_status: 'rejected',
        rejection_reason: rejectionReason
      });
      setResults(prev => prev.map(r => 
        r.id === selectedResult.id ? { ...r, approval_status: 'rejected', rejection_reason: rejectionReason } : r
      ));
      setRejectDialogOpen(false);
      setSelectedResult(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting result:', err);
      alert('Failed to reject result');
    } finally {
      setIsUpdating(null);
    }
  };

  const openRejectDialog = (result) => {
    setSelectedResult(result);
    setRejectionReason(result.rejection_reason || '');
    setRejectDialogOpen(true);
  };

  const getFilteredResults = (status) => {
    return results.filter(r => {
      const matchesStatus = (r.approval_status || 'pending') === status;
      const matchesSearch = !searchQuery.trim() || 
        r.test_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.laboratory?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-600';
      case 'high': return 'bg-orange-100 text-orange-600';
      case 'low': return 'bg-blue-100 text-blue-600';
      case 'critical': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const counts = {
    pending: results.filter(r => (r.approval_status || 'pending') === 'pending').length,
    approved: results.filter(r => r.approval_status === 'approved').length,
    rejected: results.filter(r => r.approval_status === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  const ResultCard = ({ result, showActions = false }) => (
    <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{result.test_name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="font-medium">{result.user_name || 'Unknown User'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{result.laboratory || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(result.test_date), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(result.status)} text-xs font-medium`}>
                  {result.status?.charAt(0).toUpperCase() + result.status?.slice(1)}
                </Badge>
                {result.rejection_reason && (
                  <span className="text-xs text-red-500 italic">Reason: {result.rejection_reason}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link to={createPageUrl(`CompleteBloodCount?id=${result.id}&from=BloodTestManagement`)}>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            {showActions && (
              <>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleApprove(result)}
                  disabled={isUpdating === result.id}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => openRejectDialog(result)}
                  disabled={isUpdating === result.id}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ status }) => (
    <Card className="bg-white rounded-2xl border-0 shadow-sm">
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {status === 'pending' && <Clock className="w-8 h-8 text-yellow-500" />}
          {status === 'approved' && <CheckCircle className="w-8 h-8 text-green-500" />}
          {status === 'rejected' && <XCircle className="w-8 h-8 text-red-500" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No {status} results
        </h3>
        <p className="text-gray-500 text-sm">
          {status === 'pending' && 'All blood test results have been reviewed'}
          {status === 'approved' && 'No blood test results have been approved yet'}
          {status === 'rejected' && 'No blood test results have been rejected'}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Admin")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Blood Test Management</h1>
        <div className="w-10"></div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by patient, lab, or test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 rounded-xl h-12"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="pending" 
              className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Clock className="w-4 h-4 mr-2 text-yellow-500" />
              Pending
              <Badge className="ml-2 bg-yellow-100 text-yellow-700">{counts.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="approved"
              className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Approved
              <Badge className="ml-2 bg-green-100 text-green-700">{counts.approved}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="rejected"
              className="rounded-lg py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              Rejected
              <Badge className="ml-2 bg-red-100 text-red-700">{counts.rejected}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {getFilteredResults('pending').length > 0 ? (
              getFilteredResults('pending').map(result => (
                <ResultCard key={result.id} result={result} showActions={true} />
              ))
            ) : (
              <EmptyState status="pending" />
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6 space-y-4">
            {getFilteredResults('approved').length > 0 ? (
              getFilteredResults('approved').map(result => (
                <ResultCard key={result.id} result={result} />
              ))
            ) : (
              <EmptyState status="approved" />
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6 space-y-4">
            {getFilteredResults('rejected').length > 0 ? (
              getFilteredResults('rejected').map(result => (
                <ResultCard key={result.id} result={result} />
              ))
            ) : (
              <EmptyState status="rejected" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reject Blood Test Result
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this blood test result.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isUpdating === selectedResult?.id}
            >
              {isUpdating === selectedResult?.id ? 'Rejecting...' : 'Reject Result'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}