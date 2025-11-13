import { useState, useEffect } from "react";
import { Clinic, User } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Save
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClinicSettingsPage() {
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_email: '',
    clinic_phone: '',
    address: '',
    clinic_type: 'general_practice',
    license_number: ''
  });

  useEffect(() => {
    loadClinic();
  }, []);

  const loadClinic = async () => {
    try {
      const currentUser = await User.me();
      
      if (currentUser.role !== 'admin') {
        alert('Access denied.');
        return;
      }

      const clinics = await Clinic.list('-created_date', 1);
      if (clinics.length > 0) {
        setClinic(clinics[0]);
        setFormData({
          clinic_name: clinics[0].clinic_name || '',
          clinic_email: clinics[0].clinic_email || '',
          clinic_phone: clinics[0].clinic_phone || '',
          address: clinics[0].address || '',
          clinic_type: clinics[0].clinic_type || 'general_practice',
          license_number: clinics[0].license_number || ''
        });
      }
    } catch (error) {
      console.error('Error loading clinic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (clinic) {
        await Clinic.update(clinic.id, formData);
      } else {
        await Clinic.create(formData);
      }
      alert('Clinic settings saved successfully!');
      loadClinic();
    } catch (error) {
      console.error('Error saving clinic:', error);
      alert('Failed to save clinic settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
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
        <h1 className="text-lg font-semibold text-gray-900">Clinic Settings</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-4 py-6">
        <Card className="bg-white rounded-[24px] border-0 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="clinic_name">Clinic Name *</Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="clinic_name"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                  className="pl-10"
                  placeholder="Health Wellness Clinic"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clinic_email">Email *</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="clinic_email"
                  type="email"
                  value={formData.clinic_email}
                  onChange={(e) => setFormData({...formData, clinic_email: e.target.value})}
                  className="pl-10"
                  placeholder="clinic@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clinic_phone">Phone</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="clinic_phone"
                  value={formData.clinic_phone}
                  onChange={(e) => setFormData({...formData, clinic_phone: e.target.value})}
                  className="pl-10"
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="clinic_type">Clinic Type</Label>
              <Select value={formData.clinic_type} onValueChange={(value) => setFormData({...formData, clinic_type: value})}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general_practice">General Practice</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="wellness_center">Wellness Center</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={formData.license_number}
                onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                className="mt-2"
                placeholder="MED-123456"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="pl-10 min-h-[100px]"
                  placeholder="123 Medical Street, London, UK"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 h-[60px] bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-[16px]"
        >
          {isSaving ? 'Saving...' : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}