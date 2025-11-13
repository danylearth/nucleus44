import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Tests from './pages/Tests';
import AIAgent from './pages/AIAgent';
import Profile from './pages/Profile';
import HeartRate from './pages/HeartRate';
import Calories from './pages/Calories';
import Steps from './pages/Steps';
import Sleep from './pages/Sleep';
import Stress from './pages/Stress';
import Water from './pages/Water';
import PersonalInfo from './pages/PersonalInfo';
import CalendarIntegration from './pages/CalendarIntegration';
import HealthScore from './pages/HealthScore';
import Supplements from './pages/Supplements';
import LabResults from './pages/LabResults';
import LabResultDetail from './pages/LabResultDetail';
import AIInbox from './pages/AIInbox';
import APIDocumentation from './pages/APIDocumentation';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import ChatHistory from './pages/ChatHistory';
import Onboarding from './pages/Onboarding';
import CompleteBloodCount from './pages/CompleteBloodCount';
import MuhdoProfile from './pages/MuhdoProfile';
import BloodResults from './pages/BloodResults';
import ClinicDashboard from './pages/ClinicDashboard';
import ClinicPatients from './pages/ClinicPatients';
import ClinicSettings from './pages/ClinicSettings';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Devices": Devices,
    "Tests": Tests,
    "AIAgent": AIAgent,
    "Profile": Profile,
    "HeartRate": HeartRate,
    "Calories": Calories,
    "Steps": Steps,
    "Sleep": Sleep,
    "Stress": Stress,
    "Water": Water,
    "PersonalInfo": PersonalInfo,
    "CalendarIntegration": CalendarIntegration,
    "HealthScore": HealthScore,
    "Supplements": Supplements,
    "LabResults": LabResults,
    "LabResultDetail": LabResultDetail,
    "AIInbox": AIInbox,
    "APIDocumentation": APIDocumentation,
    "Admin": Admin,
    "Analytics": Analytics,
    "ChatHistory": ChatHistory,
    "Onboarding": Onboarding,
    "CompleteBloodCount": CompleteBloodCount,
    "MuhdoProfile": MuhdoProfile,
    "BloodResults": BloodResults,
    "ClinicDashboard": ClinicDashboard,
    "ClinicPatients": ClinicPatients,
    "ClinicSettings": ClinicSettings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};