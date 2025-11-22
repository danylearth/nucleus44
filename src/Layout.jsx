import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';
import { BarChart, Heart, Stethoscope, Bot, User as UserIcon, LogOut, Settings, Bell, LayoutGrid, Shield, Home, TrendingUp, ShoppingCart, MessageCircle } from 'lucide-react';

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
};

const MobileBottomNav = React.memo(() => {
  const location = useLocation();

  const navItems = [
    { path: createPageUrl('Dashboard'), icon: Home, label: 'Dashboard' },
    // { path: createPageUrl('Tests'), icon: ShoppingCart, label: 'Shop' },
    { path: createPageUrl('AIAgent'), icon: MessageCircle, label: 'Chat' }
  ];

  return (
    <div className="lg:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center">
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-lg rounded-full p-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.label} to={item.path}>
              {isActive ? (
                <div className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-3 transition-all duration-300 ease-in-out">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <item.icon className="w-6 h-6 text-gray-500" />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
});

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check for Onboarding page
      if (currentPageName === 'Onboarding') {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // Check if user needs onboarding (skip check if already on onboarding page)
        if (currentUser && !currentUser.onboarding_complete && currentPageName !== 'Onboarding') {
          window.location.href = createPageUrl('Onboarding');
          return;
        }
      } catch (error) {
        console.log("User not authenticated, triggering login...");
        // Use platform's built-in authentication
        await User.login();
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [currentPageName]);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  // Don't show layout for Onboarding page
  if (currentPageName === 'Onboarding') {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {children}
        </div>
      </>
    );
  }

  // Show loading while checking auth status
  if (isCheckingAuth) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Check if current page is a chat page
  const isChatPage = location.pathname === createPageUrl('AIAgent') || currentPageName === 'AIAgent';
  
  // Check if user is clinic role
  const isClinicUser = user?.role === 'admin'; // TODO: Change to 'clinic_admin' role when implemented

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
        rel="stylesheet"
      />
      
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Desktop Sidebar */}
        <div className="hidden border-r bg-gray-900/95 lg:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-[60px] items-center border-b px-6">
              <Link className="flex items-center gap-2 font-semibold text-white" to={createPageUrl(isClinicUser ? 'ClinicDashboard' : 'Dashboard')}>
                <LayoutGrid className="h-6 w-6" />
                <span>Nucleus</span>
              </Link>
              <button className="ml-auto h-8 w-8 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                {isClinicUser ? (
                  <>
                    <NavLink to={createPageUrl('ClinicDashboard')} icon={LayoutGrid}>Clinic Dashboard</NavLink>
                    <NavLink to={createPageUrl('ClinicPatients')} icon={UserIcon}>Patients</NavLink>
                    <NavLink to={createPageUrl('ClinicSettings')} icon={Settings}>Settings</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to={createPageUrl('Dashboard')} icon={LayoutGrid}>Dashboard</NavLink>
                    <NavLink to={createPageUrl('HeartRate')} icon={Heart}>Heart Rate</NavLink>
                    <NavLink to={createPageUrl('LabResults')} icon={Stethoscope}>Lab Results</NavLink>
                    <NavLink to={createPageUrl('BloodResults')} icon={Stethoscope}>Blood Results</NavLink>
                    {/* <NavLink to={createPageUrl('Tests')} icon={ShoppingCart}>Health Tests</NavLink> */}
                    <NavLink to={createPageUrl('AIAgent')} icon={Bot}>AI Agent</NavLink>
                    <NavLink to={createPageUrl('Profile')} icon={UserIcon}>Profile</NavLink>
                  </>
                )}
                {user?.role === 'admin' && !isClinicUser && (
                  <NavLink to={createPageUrl('Admin')} icon={Shield}>Admin</NavLink>
                )}
              </nav>
            </div>
            <div className="mt-auto p-4 border-t border-gray-800">
              {user ? (
                <div className="flex items-center gap-3">
                  <img src={user.picture || `https://avatar.vercel.sh/${user.email}.png`} alt="User" className="w-9 h-9 rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{user.full_name}</span>
                    <span className="text-gray-400 text-xs">{user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="ml-auto text-gray-400 hover:text-white">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-700"></div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-gray-700 rounded"></div>
                    <div className="h-3 w-32 bg-gray-700 rounded"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-col">
          <main className="bg-gray-50 flex flex-1 flex-col gap-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        {!isChatPage && <MobileBottomNav />}
      </div>
    </>
  );
}