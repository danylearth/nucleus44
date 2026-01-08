import { useState, useEffect, useRef } from "react";
import { User, Clinic } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft,
  Bell,
  User as UserIcon,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Camera
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function PersonalInfoPage() {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    date_of_birth: '',
    phone_number: '',
    address: '',
    profile_picture: '',
    password: '',
    repeat_password: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load clinic information if user is assigned to one
      if (currentUser.clinic_id) {
        try {
          console.log('🏥 Loading clinic with ID:', currentUser.clinic_id);
          
          // Check if clinic_id looks like a UUID or a name
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.clinic_id);
          
          if (isUUID) {
            // Valid UUID, fetch the clinic
            const userClinic = await Clinic.get(currentUser.clinic_id);
            setClinic(userClinic);
            console.log('✅ Clinic loaded:', userClinic.clinic_name);
          } else {
            // Not a valid UUID, might be a clinic name - try to find by name
            console.warn('⚠️ clinic_id is not a UUID, attempting to find clinic by name...');
            const clinics = await Clinic.filter({ clinic_name: currentUser.clinic_id });
            
            if (clinics.length > 0) {
              setClinic(clinics[0]);
              console.log('✅ Found clinic by name:', clinics[0].clinic_name);
              console.log('⚠️ Please update user.clinic_id to:', clinics[0].id);
            } else {
              console.error('❌ Clinic not found with name:', currentUser.clinic_id);
            }
          }
        } catch (error) {
          console.error('❌ Error loading clinic:', error);
          // Don't break the page if clinic fails to load
        }
      }
      
      setFormData({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        date_of_birth: currentUser.date_of_birth || '',
        phone_number: currentUser.phone_number || '',
        address: currentUser.address || '',
        profile_picture: currentUser.profile_picture || '',
        password: '',
        repeat_password: ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setFormData({
        full_name: '',
        email: '',
        date_of_birth: '',
        phone_number: '',
        address: '',
        profile_picture: '',
        password: '',
        repeat_password: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_picture: file_url });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTestUpdate = async () => {
    try {
      console.log('🧪 Running update tests...');
      const response = await base44.functions.invoke('testUserUpdate', {});
      console.log('🧪 Test results:', response);
      alert(`Test Results:\nName Update: ${response.tests.nameUpdate ? '✅' : '❌'}\nDOB Update: ${response.tests.dobUpdate ? '✅' : '❌'}\nPhone Update: ${response.tests.phoneUpdate ? '✅' : '❌'}`);
    } catch (error) {
      console.error('❌ Test error:', error);
      alert(`Test failed: ${error.message}`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        phone_number: formData.phone_number,
        address: formData.address,
        profile_picture: formData.profile_picture
      };
      
      console.log('🔄 Updating user with:', updateData);
      const result = await base44.auth.updateMe(updateData);
      console.log('✅ Update successful:', result);
      
      // Verify the update
      const updatedUser = await base44.auth.me();
      console.log('✅ User after update:', {
        full_name: updatedUser.full_name,
        date_of_birth: updatedUser.date_of_birth,
        phone_number: updatedUser.phone_number
      });
      
      await loadUserData();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Error saving user data:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, label: '' };
    if (formData.password.length < 6) return { strength: 25, label: 'Weak' };
    if (formData.password.length < 10) return { strength: 50, label: 'Fair' };
    if (formData.password.length >= 10) return { strength: 100, label: 'Strong Pass' };
  };

  const passwordStrength = getPasswordStrength();

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Profile")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Personal Information</h1>
        <button className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Main Content Card */}
      <div className="px-4 py-6">
        <Card className="bg-white rounded-[24px] border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Profile Picture */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <img 
                src={formData.profile_picture || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c5c2121d3e86e4be58e018/be300faf8_92e43541-1304-4687-9e2f-3617bacf279e1.png"} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-10 h-10 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center border-4 border-white disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Assigned Clinic - Read Only */}
              {clinic && (
                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-2 block">
                    Assigned Clinic
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-teal-500" />
                    <div className="pl-10 pr-4 py-3 bg-teal-50 border-2 border-teal-200 rounded-[14px]">
                      <div className="font-semibold text-teal-900">{clinic.clinic_name}</div>
                      {clinic.clinic_type && (
                        <div className="text-sm text-teal-600 capitalize">
                          {clinic.clinic_type.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">This is the clinic managing your health data</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-900 mb-2 block">
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="pl-10 bg-white border-gray-200 rounded-[14px] h-12"
                  />
                </div>
              </div>

              {/* Email - Read Only */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
                  Email
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-gray-100 border-gray-200 rounded-[14px] h-12 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              {/* Date of Birth */}
              <div>
                <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-900 mb-2 block">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Input
                    id="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="pr-10 bg-white border-gray-200 rounded-[14px] h-12"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone_number" className="text-sm font-medium text-gray-900 mb-2 block">
                  Phone Number
                </Label>
                <div className="flex gap-2">
                  <div className="w-20 h-12 bg-white border border-gray-200 rounded-[14px] flex items-center justify-center gap-1">
                    <span className="text-2xl">🇬🇧</span>
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    className="flex-1 bg-white border-gray-200 rounded-[14px] h-12"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-900 mb-2 block">
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-white border-gray-200 rounded-[14px] min-h-[120px] resize-none"
                  placeholder="Start typing your address..."
                />
              </div>

              {/* Change Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-900 mb-2 block">
                  Change Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 pr-10 bg-white border-gray-200 rounded-[14px] h-12"
                    placeholder="****************"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Repeat Password */}
              <div>
                <Label htmlFor="repeat_password" className="text-sm font-medium text-gray-900 mb-2 block">
                  Repeat Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="repeat_password"
                    type={showRepeatPassword ? "text" : "password"}
                    value={formData.repeat_password}
                    onChange={(e) => setFormData({...formData, repeat_password: e.target.value})}
                    className="pl-10 pr-10 bg-white border-gray-200 rounded-[14px] h-12"
                    placeholder="****************"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength < 50 ? 'bg-red-500' : 
                        passwordStrength.strength < 75 ? 'bg-yellow-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm font-medium ${
                    passwordStrength.strength < 50 ? 'text-red-500' : 
                    passwordStrength.strength < 75 ? 'text-yellow-500' : 'text-teal-500'
                  }`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="px-4 py-4 space-y-3">
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full h-[60px] bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-[16px] transition-colors duration-200"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        
        <Button 
          onClick={handleTestUpdate}
          variant="outline"
          className="w-full h-[50px] border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-[16px]"
        >
          🧪 Run Update Tests
        </Button>
      </div>
    </div>
  );
}