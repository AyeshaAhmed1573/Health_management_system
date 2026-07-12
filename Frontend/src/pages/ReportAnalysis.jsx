import { ReportAnalysis } from "@/components/chat/ReportAnalysis";
import { useLocation } from "wouter";

export default function ReportAnalysisPage() {
  const [, navigate] = useLocation();

  const handleNavigate = (screen) => {
    if (screen === "doctors") {
      navigate("/doctors");
    } else if (screen === "chat-center") {
      navigate("/chat-center");
    }
  };

  return <ReportAnalysis onNavigate={handleNavigate} />;
}
