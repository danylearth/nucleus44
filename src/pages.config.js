/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAgent from './pages/AIAgent';
import AIInbox from './pages/AIInbox';
import APIDocumentation from './pages/APIDocumentation';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import BloodResults from './pages/BloodResults';
import BloodTestManagement from './pages/BloodTestManagement';
import CalendarIntegration from './pages/CalendarIntegration';
import Calories from './pages/Calories';
import Cart from './pages/Cart';
import ChatHistory from './pages/ChatHistory';
import Checkout from './pages/Checkout';
import ClinicDashboard from './pages/ClinicDashboard';
import ClinicPatients from './pages/ClinicPatients';
import ClinicSettings from './pages/ClinicSettings';
import CompleteBloodCount from './pages/CompleteBloodCount';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DnaTestManagement from './pages/DnaTestManagement';
import HealthScore from './pages/HealthScore';
import HeartRate from './pages/HeartRate';
import Home from './pages/Home';
import LabResultDetail from './pages/LabResultDetail';
import LabResults from './pages/LabResults';
import MuhdoProfile from './pages/MuhdoProfile';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PersonalInfo from './pages/PersonalInfo';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Sleep from './pages/Sleep';
import Steps from './pages/Steps';
import Stress from './pages/Stress';
import Supplements from './pages/Supplements';
import TermsAndConditions from './pages/TermsAndConditions';
import TestDetail from './pages/TestDetail';
import Water from './pages/Water';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAgent": AIAgent,
    "AIInbox": AIInbox,
    "APIDocumentation": APIDocumentation,
    "Admin": Admin,
    "Analytics": Analytics,
    "BloodResults": BloodResults,
    "BloodTestManagement": BloodTestManagement,
    "CalendarIntegration": CalendarIntegration,
    "Calories": Calories,
    "Cart": Cart,
    "ChatHistory": ChatHistory,
    "Checkout": Checkout,
    "ClinicDashboard": ClinicDashboard,
    "ClinicPatients": ClinicPatients,
    "ClinicSettings": ClinicSettings,
    "CompleteBloodCount": CompleteBloodCount,
    "Dashboard": Dashboard,
    "Devices": Devices,
    "DnaTestManagement": DnaTestManagement,
    "HealthScore": HealthScore,
    "HeartRate": HeartRate,
    "Home": Home,
    "LabResultDetail": LabResultDetail,
    "LabResults": LabResults,
    "MuhdoProfile": MuhdoProfile,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PersonalInfo": PersonalInfo,
    "PrivacyPolicy": PrivacyPolicy,
    "ProductDetail": ProductDetail,
    "Profile": Profile,
    "Shop": Shop,
    "Sleep": Sleep,
    "Steps": Steps,
    "Stress": Stress,
    "Supplements": Supplements,
    "TermsAndConditions": TermsAndConditions,
    "TestDetail": TestDetail,
    "Water": Water,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};