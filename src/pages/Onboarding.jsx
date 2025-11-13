
import { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  ArrowLeft,
  User as UserIcon,
  Heart,
  Dna,
  Watch,
  CheckCircle2,
  Camera,
  Smartphone, // Added
  Download // Added
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client"; // Import base44 client

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    gender: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    activity_level: '',
    health_goals: [],
    muhdo_kit_id: '' // Add muhdo_kit_id to state
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 4; // Changed from 3 to 4
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    loadUser();
  }, []);

  // Calculate age from date of birth
  useEffect(() => {
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age: age.toString() }));
    } else {
      // Clear age if date of birth is cleared
      setFormData(prev => ({ ...prev, age: '' }));
    }
  }, [formData.date_of_birth]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Pre-fill with existing data if available
      setFormData({
        full_name: currentUser.full_name || '',
        date_of_birth: currentUser.date_of_birth || '',
        phone_number: currentUser.phone_number || '',
        gender: currentUser.gender || '',
        // Age will be calculated by the useEffect when date_of_birth is set
        age: currentUser.age || '', 
        height_cm: currentUser.height_cm || '',
        weight_kg: currentUser.weight_kg || '',
        activity_level: currentUser.activity_level || '',
        health_goals: currentUser.health_goals || [],
        muhdo_kit_id: currentUser.muhdo_kit_id || '' // Pre-fill Kit ID
      });
      
      if (currentUser.profile_picture) {
        setProfilePictureUrl(currentUser.profile_picture);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // CORRECTED: Use base44 client to call the integration
      const response = await base44.integrations.Core.UploadFile({ file });
      setProfilePictureUrl(response.file_url);
      setProfilePicture(file);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Prepare the data to save
      const dataToSave = {
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        phone_number: formData.phone_number,
        gender: formData.gender,
        age: parseInt(formData.age),
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        activity_level: formData.activity_level,
        health_goals: formData.health_goals,
        profile_picture: profilePictureUrl,
        muhdo_kit_id: formData.muhdo_kit_id, // Save the Kit ID
        onboarding_complete: true,
        last_login: new Date().toISOString()
      };

      console.log('Saving onboarding data:', dataToSave);
      
      await User.updateMyUserData(dataToSave);
      
      console.log('Onboarding data saved successfully');

      // Register user with Muhdo using base44 functions client
      try {
        const currentUser = await User.me();
        if (currentUser?.id && currentUser.date_of_birth) {
          console.log('🧬 Calling muhdoRegisterUser function...');
          // Use base44.functions.invoke to call the backend function
          await base44.functions.invoke('muhdoRegisterUser', { 
            user_id: currentUser.id 
          });
          console.log('✅ Muhdo registration function invoked.');
        } else {
          console.log('⚠️ Skipping Muhdo registration: user ID or DOB missing.');
        }
      } catch (muhdoError) {
        console.error('⚠️ Muhdo registration failed (non-blocking):', muhdoError);
        // Don't block user flow if Muhdo registration fails
      }
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to save your information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHealthGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      health_goals: prev.health_goals.includes(goal)
        ? prev.health_goals.filter(g => g !== goal)
        : [...prev.health_goals, goal]
    }));
  };

  const canProceedStep1 = formData.full_name && formData.date_of_birth;
  const canProceedStep2 = formData.gender && formData.age && formData.height_cm && formData.weight_kg && formData.activity_level;

  // Available wearable providers
  const wearableProviders = [
    { id: 'apple_health', name: 'Apple Health', icon: '🍎', color: 'bg-gray-900' },
    { id: 'google_fit', name: 'Google Fit', icon: '🔵', color: 'bg-blue-500' },
    { id: 'garmin', name: 'Garmin', icon: '⚫', color: 'bg-gray-700' },
    { id: 'fitbit', name: 'Fitbit', icon: '💚', color: 'bg-teal-500' },
    { id: 'oura', name: 'Oura Ring', icon: '💍', color: 'bg-purple-600' },
    { id: 'whoop', name: 'WHOOP', icon: '⚪', color: 'bg-gray-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="p-4 pt-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            {step > 1 && (
              <button onClick={handleBack} className="p-2 -ml-2">
                <ArrowLeft className="w-6 h-6 text-gray-900" />
              </button>
            )}
            <div className="flex-1 text-center">
              <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
            </div>
            <div className="w-8"></div>
          </div>
          <Progress value={progress} className="h-2 mb-8" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Basic Info + Profile Picture */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Nucleus</h1>
                <p className="text-gray-600">Let's start by getting to know you better</p>
              </div>

              <Card className="bg-white rounded-[24px] border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {profilePictureUrl ? (
                          <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                      <label htmlFor="profile-picture" className="absolute bottom-0 right-0 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-600 transition-colors shadow-lg border-4 border-white">
                        {isUploadingImage ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Camera className="w-5 h-5 text-white" />
                        )}
                      </label>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Upload your profile picture</p>
                  </div>

                  <div>
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-900 mb-2 block">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="John Doe"
                      className="bg-white border-gray-200 rounded-[14px] h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth" className="text-sm font-medium text-gray-900 mb-2 block">
                      Date of Birth *
                    </Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      className="bg-white border-gray-200 rounded-[14px] h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone_number" className="text-sm font-medium text-gray-900 mb-2 block">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="+44 (555) 123-456"
                      className="bg-white border-gray-200 rounded-[14px] h-12"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleNext}
                disabled={!canProceedStep1}
                className="w-full h-[60px] bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-[16px]"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Health Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Profile</h1>
                <p className="text-gray-600">This helps us personalize your experience</p>
              </div>

              <Card className="bg-white rounded-[24px] border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Gender */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">
                      Gender *
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'other'].map((gender) => (
                        <button
                          key={gender}
                          onClick={() => setFormData({...formData, gender})}
                          className={`p-4 rounded-[14px] border-2 font-medium transition-all ${
                            formData.gender === gender
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age - Auto-calculated Display */}
                  {formData.age && (
                    <div className="bg-teal-50 border border-teal-200 rounded-[14px] p-4">
                      <Label className="text-sm font-medium text-teal-900 mb-1 block">
                        Age (Calculated from Date of Birth)
                      </Label>
                      <p className="text-2xl font-bold text-teal-700">{formData.age} years old</p>
                    </div>
                  )}

                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height_cm" className="text-sm font-medium text-gray-900 mb-2 block">
                        Height (cm) *
                      </Label>
                      <Input
                        id="height_cm"
                        type="number"
                        value={formData.height_cm}
                        onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                        placeholder="170"
                        className="bg-white border-gray-200 rounded-[14px] h-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight_kg" className="text-sm font-medium text-gray-900 mb-2 block">
                        Weight (kg) *
                      </Label>
                      <Input
                        id="weight_kg"
                        type="number"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                        placeholder="70"
                        className="bg-white border-gray-200 rounded-[14px] h-12"
                      />
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">
                      Activity Level *
                    </Label>
                    <div className="space-y-2">
                      {[
                        { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                        { value: 'lightly_active', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
                        { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
                        { value: 'very_active', label: 'Very Active', desc: 'Exercise 6-7 days/week' },
                        { value: 'extremely_active', label: 'Extremely Active', desc: 'Very intense daily exercise' }
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setFormData({...formData, activity_level: level.value})}
                          className={`w-full p-4 rounded-[14px] border-2 text-left transition-all ${
                            formData.activity_level === level.value
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Health Goals */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">
                      Health Goals (Select all that apply)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Improve Fitness',
                        'Better Sleep',
                        'Weight Loss',
                        'Build Muscle',
                        'Reduce Stress',
                        'Heart Health',
                        'Better Nutrition'
                      ].map((goal) => (
                        <Badge
                          key={goal}
                          onClick={() => toggleHealthGoal(goal)}
                          className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                            formData.health_goals.includes(goal)
                              ? 'bg-gray-900 text-white hover:bg-gray-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleNext}
                disabled={!canProceedStep2}
                className="w-full h-[60px] bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-[16px]"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 3: Activate Your Health Kit */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Dna className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Activate Your Health Kit</h1>
                <p className="text-gray-600">Enter the ID printed on your physical test kit</p>
              </div>

              <Card className="bg-white rounded-[24px] border-0 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="muhdo_kit_id" className="text-sm font-medium text-gray-900 mb-2 block">
                      Kit ID *
                    </Label>
                    <Input
                      id="muhdo_kit_id"
                      value={formData.muhdo_kit_id}
                      onChange={(e) => setFormData({...formData, muhdo_kit_id: e.target.value.toUpperCase()})}
                      placeholder="e.g., M000ABCXYZ"
                      className="bg-white border-gray-200 rounded-[14px] h-12 text-lg font-mono tracking-widest text-center"
                    />
                     <p className="text-xs text-gray-500 mt-2 text-center">You can find this ID on the barcode of your test kit.</p>
                  </div>

                   <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 text-center">
                      Don't have a kit yet? You can add it later from your profile settings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handleNext} // Changed to handleNext to proceed to Step 4
                disabled={!formData.muhdo_kit_id}
                className="w-full h-[60px] bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-[16px]"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <button
                onClick={handleNext} // Changed to handleNext to proceed to Step 4
                className="w-full text-gray-600 text-sm hover:text-gray-900 py-2"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 4: Connect Wearable Devices (NEW) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Watch className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Devices</h1>
                <p className="text-gray-600">Sync your health data from wearables and fitness apps</p>
              </div>

              <Card className="bg-white rounded-[24px] border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Available Providers */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">
                      Available Integrations
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {wearableProviders.map((provider) => (
                        <div
                          key={provider.id}
                          className="flex items-center gap-3 p-4 rounded-[14px] border-2 border-gray-200 bg-gray-50"
                        >
                          <div className={`w-10 h-10 ${provider.color} rounded-full flex items-center justify-center text-2xl`}>
                            {provider.icon}
                          </div>
                          <span className="font-medium text-gray-700">{provider.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Connect via Mobile App</h3>
                        <p className="text-sm text-blue-700">
                          All device connections are securely managed through the Nucleus mobile app. 
                          Download the app to connect your wearables and start syncing your health data.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* App Download Buttons */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-900 block">
                      Download the App
                    </Label>
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 gap-2">
                        <Download className="w-4 h-4" />
                        App Store
                      </Button>
                      <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 gap-2">
                        <Download className="w-4 h-4" />
                        Play Store
                      </Button>
                    </div>
                  </div>

                  {/* Info Badge */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>You can also connect devices later from your profile</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="w-full h-[60px] bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-[16px]"
                >
                  {isSaving ? 'Completing setup...' : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>

                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="w-full text-gray-600 text-sm hover:text-gray-900 py-2"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
