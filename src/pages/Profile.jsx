import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  ChevronLeft,
  Bell,
  User as UserIcon,
  MapPin,
  Calendar,
  Settings,
  ChevronRight,
  Camera } from
"lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser({
        full_name: 'User',
        email: 'user@email.com',
        profile_picture: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await User.logout();
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      // User clicked OK/Yes - do nothing, just close
    } else {
      // User clicked Cancel/No - do nothing, just close
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture: file_url });
      await loadUserData();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>);

  }

  const menuItems = [
  {
    title: 'Personal Information',
    subtitle: 'Manage your profile details',
    icon: UserIcon,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-50',
    link: createPageUrl("PersonalInfo")
  },
  // {
  //   title: 'Connected Devices',
  //   subtitle: 'Manage your health devices',
  //   icon: MapPin,
  //   iconColor: 'text-teal-500',
  //   iconBg: 'bg-teal-50',
  //   link: createPageUrl("Devices")
  // },
  // {
  //   title: 'Calendar Integration',
  //   subtitle: 'Connect your calendar',
  //   icon: Calendar,
  //   iconColor: 'text-teal-500',
  //   iconBg: 'bg-teal-50',
  //   link: createPageUrl("CalendarIntegration")
  // },
  {
    title: 'Logout',
    subtitle: '',
    icon: Settings,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-50',
    action: handleLogout
  },
  {
    title: 'Delete Account',
    subtitle: '',
    icon: UserIcon,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    action: handleDeleteAccount
  }];

  const profilePicture = user?.profile_picture || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c5c2121d3e86e4be58e018/be300faf8_92e43541-1304-4687-9e2f-3617bacf279e1.png';

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
        <div className="p-2 -mr-2">
          <Bell className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* User Info Section - Updated Style */}
      <div className="pt-10 pr-4 pb-6 pl-4 relative">
        {user ? (
          <div className="bg-white rounded-[24px] shadow-sm pt-16 pb-6 px-4 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <div className="relative">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p>User not found.</p>
          </div>
        )}
      </div>
      
      {/* Profile Options List */}
      <div className="px-4 space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const ItemIcon = item.icon;

            const MenuCard =
            <Card key={index} className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                    <ItemIcon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-left mb-1">
                            {item.title}
                          </h3>
                          {item.subtitle && (
                            <p className="text-sm text-gray-500 text-left leading-relaxed">
                              {item.subtitle}
                            </p>
                          )}
                </CardContent>
              </Card>;


            if (item.link) {
              return (
                <Link key={index} to={item.link}>
                  {MenuCard}
                </Link>);

            }

            return (
              <button
                key={index}
                onClick={item.action}
                className="text-left w-full">

                {MenuCard}
              </button>);

          })}
        </div>
      </div>
    </div>);

}