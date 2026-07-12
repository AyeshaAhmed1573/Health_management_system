import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import ReportAnalysis from "@/pages/ReportAnalysis";
import DoctorSignupPage from "@/pages/DoctorSignupPage";
import LaboratorySignupPage from "@/pages/LaboratorySignupPage";
import PharmacySignupPage from "@/pages/PharmacySignupPage";

function Router() {
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
        <Route path="/report" component={ReportAnalysis} />
        <Route path="/doctor-signup" component={DoctorSignupPage} />
        <Route path="/laboratory-signup" component={LaboratorySignupPage} />
        <Route path="/pharmacy-signup" component={PharmacySignupPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
