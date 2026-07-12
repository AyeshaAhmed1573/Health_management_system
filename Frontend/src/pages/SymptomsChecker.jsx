import { SymptomsChecker } from "@/components/chat/SymptomsChecker";
import { useLocation } from "wouter";

export default function SymptomsCheckerPage() {
  const [, navigate] = useLocation();

  const handleNavigate = (screen) => {
    if (screen === "doctors") {
      navigate("/doctors");
    } else if (screen === "chat-center") {
      navigate("/chat-center");
    }
  };

  return <SymptomsChecker onNavigate={handleNavigate} />;
}
