
import { useState, useEffect } from "react";
import { User, Clinic } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft,
  Search,
  Users,
  Calendar,
  TrendingUp,
  UserPlus // Added UserPlus icon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { registerPatient } from "@/functions/registerPatient"; // Added registerPatient function
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Added Dialog components
import { Label } from "@/components/ui/label"; // Added Label component for form fields

export default function ClinicPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false); // New state for dialog visibility
  const [isRegistering, setIsRegistering] = useState(false); // New state for registration loading
  const [clinicId, setClinicId] = useState(null); // New state to store clinic ID
  
  // New patient form state
  const [newPatient, setNewPatient] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const currentUser = await User.me();
      
      if (currentUser.role !== 'admin') {
        alert('Access denied.');
        return;
      }

      const clinics = await Clinic.list('-created_date', 1);
      if (clinics.length > 0) {
        setClinicId(clinics[0].id); // Store clinic ID
        const clinicPatients = await User.filter({ clinic_id: clinics[0].id }, '-last_login');
        setPatients(clinicPatients);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPatient = async () => {
    if (!newPatient.patient_name || !newPatient.patient_email) {
      alert('Please provide patient name and email');
      return;
    }

    if (!clinicId) {
      alert('Clinic ID not found. Cannot register patient.');
      return;
    }

    setIsRegistering(true);
    try {
      const response = await registerPatient({
        clinic_id: clinicId,
        patient_email: newPatient.patient_email,
        patient_name: newPatient.patient_name,
        patient_phone: newPatient.patient_phone,
        send_invitation: true
      });

      if (response && response.data && response.data.success) {
        alert(`Patient registered successfully!\n\nKit ID: ${response.data.patient.muhdo_kit_id}\n\nInvitation email sent to ${newPatient.patient_email}`);
        
        // Reset form and close dialog
        setNewPatient({ patient_name: '', patient_email: '', patient_phone: '' });
        setShowAddDialog(false);
        
        // Reload patients list
        loadPatients();
      } else {
        alert(response && response.data && response.data.error ? response.data.error : 'Failed to register patient');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(`Failed to register patient: ${error.message || error}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const getPatientStatus = (patient) => {
    if (!patient.last_login) return 'inactive';
    const daysSinceLogin = (Date.now() - new Date(patient.last_login).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin <= 7) return 'active';
    if (daysSinceLogin <= 30) return 'moderate';
    return 'inactive';
  };

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      patient.full_name?.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.muhdo_kit_id?.toLowerCase().includes(query)
    );

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && getPatientStatus(patient) === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("ClinicDashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">All Patients</h1>
        
        {/* Add Patient Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="patient_name">Full Name *</Label>
                <Input
                  id="patient_name"
                  value={newPatient.patient_name}
                  onChange={(e) => setNewPatient({...newPatient, patient_name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="patient_email">Email *</Label>
                <Input
                  id="patient_email"
                  type="email"
                  value={newPatient.patient_email}
                  onChange={(e) => setNewPatient({...newPatient, patient_email: e.target.value})}
                  placeholder="john@example.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="patient_phone">Phone (Optional)</Label>
                <Input
                  id="patient_phone"
                  type="tel"
                  value={newPatient.patient_phone}
                  onChange={(e) => setNewPatient({...newPatient, patient_phone: e.target.value})}
                  placeholder="+44 20 1234 5678"
                  className="mt-2"
                />
              </div>
              <Button 
                onClick={handleRegisterPatient} 
                disabled={isRegistering}
                className="w-full bg-teal-500 hover:bg-teal-600"
              >
                {isRegistering ? 'Registering...' : 'Register Patient & Send Invitation'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                An invitation email will be sent with their unique Kit ID
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 rounded-xl h-12"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'moderate', label: 'Moderate' },
            { id: 'inactive', label: 'Inactive' }
          ].map((filter) => (
            <Button
              key={filter.id}
              variant={filterStatus === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(filter.id)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Patients List */}
        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const status = getPatientStatus(patient);
            const statusColors = {
              active: 'bg-green-100 text-green-600',
              moderate: 'bg-yellow-100 text-yellow-600',
              inactive: 'bg-gray-100 text-gray-600'
            };

            return (
              <Link key={patient.id} to={createPageUrl(`PatientProfile?id=${patient.id}`)}>
                <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={patient.profile_picture || `https://avatar.vercel.sh/${patient.email}.png`}
                          alt={patient.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                        </div>
                      </div>
                      <Badge className={`${statusColors[status]} text-xs`}>
                        {status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{patient.age ? `${patient.age} years` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Score: {patient.health_score || 750}</span>
                      </div>
                      {patient.muhdo_kit_id && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">
                            Kit: {patient.muhdo_kit_id}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {filteredPatients.length === 0 && (
            <Card className="bg-white rounded-2xl border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No patients found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
