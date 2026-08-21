 import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Doctors from "@/pages/Doctors";
import Lab from "@/pages/Lab";
import Pharmacy from "@/pages/Pharmacy";
import AIModule from "@/pages/AIModule";
import Profiles from "@/pages/Profiles";
import ChatCenter from "@/pages/ChatCenter";
import AIChat from "@/pages/AIChat";
import SymptomsChecker from "@/pages/SymptomsChecker";
import FirstAidGuidance from "@/pages/FirstAidGuidance";
import BMICalculator from "@/pages/BMICalculator";
import BloodPressure from "@/pages/BloodPressure";
import BloodSugar from "@/pages/BloodSugar";
import Reports from "@/pages/Reports";
import MedicalReportsPage from "@/pages/MedicalReportsPage";
import ReportFolderView from "@/pages/ReportFolderView";
import CompareAnalyzeView from "@/pages/CompareAnalyzeView";
import DoctorSignupPage from "@/pages/DoctorSignupPage";
import LaboratorySignupPage from "@/pages/LaboratorySignupPage";
import PharmacySignupPage from "@/pages/PharmacySignupPage";
import { AuthProvider, useAuth } from "@/lib/authContext";
import AdminLogin from "@/pages/AdminLogin";
import DoctorLogin from "@/pages/DoctorLogin";
import PatientLogin from "@/pages/PatientLogin";
import LaboratoryLogin from "@/pages/LaboratoryLogin";
import PharmacyLogin from "@/pages/PharmacyLogin";
import AdminSignup from "@/pages/AdminSignup";
// import AdminDashboard from "@/pages/AdminDashboard";
import Dashboard from "@/pages/Dashboard";

function Router() {
  const { user } = useAuth();
  
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/doctors" component={Doctors} />
        <Route path="/lab" component={Lab} />
        <Route path="/pharmacy" component={Pharmacy} />
        <Route path="/ai" component={AIModule} />
        <Route path="/profiles" component={Profiles} />
        <Route path="/chat-center" component={ChatCenter} />
        <Route path="/ai-chat" component={AIChat} />
        <Route path="/symptoms" component={SymptomsChecker} />
        <Route path="/firstaid" component={FirstAidGuidance} />
        <Route path="/bmi" component={BMICalculator} />
        <Route path="/blood-pressure" component={BloodPressure} />
        <Route path="/blood-sugar" component={BloodSugar} />
        <Route path="/reports" component={Reports} />
        <Route path="/medical-reports" component={MedicalReportsPage} />
        <Route path="/reports/folder/:testType" component={ReportFolderView} />
        <Route path="/reports/compare/:testType" component={CompareAnalyzeView} />
        <Route path="/report" component={Reports} />
        <Route path="/doctor-signup" component={DoctorSignupPage} />
        <Route path="/laboratory-signup" component={LaboratorySignupPage} />
        <Route path="/pharmacy-signup" component={PharmacySignupPage} />
        <Route path="/signup" component={Signup} />
        {/* Role-specific signup routes */}
        <Route path="/admin-signup" component={AdminSignup} />
        {/* Role-specific login routes */}
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/doctor-login" component={DoctorLogin} />
        <Route path="/patient-login" component={PatientLogin} />
        <Route path="/lab-login" component={LaboratoryLogin} />
        <Route path="/pharmacy-login" component={PharmacyLogin} />
        {/* Dashboard routes */}
        <Route path="/admin/dashboard">
          {() => user ? <Dashboard currentUser={user} /> : <NotFound />}
        </Route>
        <Route path="/patient/dashboard">
          {() => user ? <Dashboard currentUser={user} /> : <NotFound />}
        </Route>
        <Route path="/doctor/dashboard">
          {() => user ? <Dashboard currentUser={user} /> : <NotFound />}
        </Route>
        <Route path="/lab/dashboard">
          {() => user ? <Dashboard currentUser={user} /> : <NotFound />}
        </Route>
        <Route path="/pharmacy/dashboard">
          {() => user ? <Dashboard currentUser={user} /> : <NotFound />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
