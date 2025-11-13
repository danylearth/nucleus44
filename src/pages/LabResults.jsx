
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Search, 
  Filter,
  ChevronRight,
  Droplet,
  Dna,
  Heart,
  Activity,
  Calendar,
  User as UserIcon,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";

export default function LabResultsPage() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadLabResults();
  }, []);

  useEffect(() => {
    let filtered = results;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => result.test_type === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(result => 
        result.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (currentUser?.role === 'admin' && result.user_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (currentUser?.role === 'admin' && result.laboratory?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredResults(filtered);
  }, [results, searchQuery, selectedCategory, currentUser]);

  const loadLabResults = async () => {
    try {
      setIsLoading(true);
      const user = await base44.auth.me().catch(() => ({ id: null, role: 'user' }));
      setCurrentUser(user);

      // --- CRITICAL FIX 1: Only run sync for admins to prevent data corruption for users ---
      if (user && user.role === 'admin') {
        try {
          await base44.functions.invoke('listBloodResults');
          console.log('🔄 Admin sync triggered from LabResults page.');
        } catch (syncError) {
          console.error('Background admin sync failed on LabResults page:', syncError);
        }
      }

      // Now, fetch the results which will include any newly synced items
      if (user.id) {
        const query = user.role === 'admin' ? {} : { user_id: user.id };
        const fetchedResults = await base44.entities.LabResult.filter(query, '-test_date');
        setResults(fetchedResults);
      } else {
         setResults([]);
      }
    } catch (error) {
      console.error('Error loading lab results:', error);
      // Mock data is no longer needed with the fix
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'blood_work', label: 'Blood Work' },
    { id: 'genetics', label: 'Genetics' },
    { id: 'hormones', label: 'Hormones' }
  ];

  const getTestIcon = (iconColor, testType) => {
    const iconProps = { className: "w-6 h-6 text-white" };
    
    switch (testType) {
      case 'blood_work': return <Droplet {...iconProps} />;
      case 'genetics': return <Dna {...iconProps} />;
      case 'hormones': return <Heart {...iconProps} />;
      default: return <Activity {...iconProps} />;
    }
  };

  const getIconBackgroundColor = (color) => {
    switch (color) {
      case 'red': return 'bg-red-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      case 'teal': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
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

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Lab Results</h1>
        <div className="w-10"></div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={currentUser?.role === 'admin' ? "Search all lab results by patient, lab, or test..." : "Search test results..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 bg-white border-gray-200 rounded-xl h-12"
          />
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-3 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap rounded-full px-6 ${
                selectedCategory === category.id
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Recent Results</h2>
          <p className="text-gray-500 text-sm mb-4">{filteredResults.length} tests found</p>
        </div>

        <div className="space-y-4">
          {filteredResults.map((result) => {
            // --- CRITICAL FIX 2: Correctly determine the target page ---
            let targetPage;
            if (result.profile_id) {
              targetPage = `MuhdoProfile?profile_id=${result.profile_id}&test_type=${result.test_type}`;
            } else if (result.test_type === 'blood_work') {
              targetPage = `CompleteBloodCount?id=${result.id}`;
            } else {
              targetPage = `LabResultDetail?id=${result.id}`;
            }
            
            return (
              <Link key={result.id} to={createPageUrl(targetPage)}>
                <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 ${getIconBackgroundColor(result.icon_color)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getTestIcon(result.icon_color, result.test_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{result.test_name}</h3>
                        {currentUser?.role === 'admin' && result.user_name && (
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
            );
          })}
        </div>

        {filteredResults.length === 0 && (
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'Try adjusting your search terms' : 'No lab results available yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
