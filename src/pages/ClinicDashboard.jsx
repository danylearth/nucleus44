import { useState, useEffect } from "react";
import { User, Clinic } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Activity,
  Heart,
  Search,
  Building2,
  FileText,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClinicDashboard() {
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    avgHealthScore: 0,
    pendingResults: 0
  });

  useEffect(() => {
    loadClinicData();
  }, []);

  const loadClinicData = async () => {
    try {
      const currentUser = await User.me();
      
      // Check if user is clinic admin
      if (currentUser.role !== 'admin') {
        alert('Access denied. Clinic dashboard is for clinic administrators only.');
        window.location.href = createPageUrl('Dashboard');
        return;
      }

      // For now, get the first clinic (in production, link user to specific clinic)
      const clinics = await Clinic.list('-created_date', 1);
      if (clinics.length > 0) {
        setClinic(clinics[0]);
        
        // Load patients for this clinic
        const clinicPatients = await User.filter({ clinic_id: clinics[0].id }, '-last_login');
        setPatients(clinicPatients);

        // Calculate stats
        const activePatients = clinicPatients.filter(p => {
          if (!p.last_login) return false;
          const lastLogin = new Date(p.last_login);
          const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLogin <= 30;
        }).length;

        const avgScore = clinicPatients.reduce((sum, p) => sum + (p.health_score || 750), 0) / (clinicPatients.length || 1);

        setStats({
          totalPatients: clinicPatients.length,
          activePatients,
          avgHealthScore: Math.round(avgScore),
          pendingResults: 0 // TODO: Count pending lab results
        });
      }
    } catch (error) {
      console.error('Error loading clinic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    return (
      patient.full_name?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.muhdo_kit_id?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="p-4 pt-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="p-4 pt-8">
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clinic Found</h3>
            <p className="text-gray-500 text-sm mb-6">Please contact admin to set up your clinic.</p>
            <Button onClick={() => window.location.href = createPageUrl('Dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pt-8 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {clinic.clinic_name}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Clinic Dashboard</p>
        </div>
        <Link to={createPageUrl("ClinicSettings")}>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPatients}</h3>
            <p className="text-sm text-gray-500">Total Patients</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activePatients}</h3>
            <p className="text-sm text-gray-500">Active This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.avgHealthScore}</h3>
            <p className="text-sm text-gray-500">Avg Health Score</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.pendingResults}</h3>
            <p className="text-sm text-gray-500">Pending Results</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search patients by name, email, or kit ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-gray-200 rounded-xl h-12"
        />
      </div>

      {/* Patients List */}
      <Card className="bg-white rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Patients ({filteredPatients.length})</CardTitle>
            <Link to={createPageUrl("ClinicPatients")}>
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPatients.slice(0, 10).map((patient) => (
              <Link key={patient.id} to={createPageUrl(`PatientProfile?id=${patient.id}`)}>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={patient.profile_picture || `https://avatar.vercel.sh/${patient.email}.png`}
                      alt={patient.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{patient.full_name}</h4>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                      {patient.muhdo_kit_id && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Kit: {patient.muhdo_kit_id}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{patient.health_score || 750}</div>
                    <p className="text-xs text-gray-500">Health Score</p>
                  </div>
                </div>
              </Link>
            ))}

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No patients found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}