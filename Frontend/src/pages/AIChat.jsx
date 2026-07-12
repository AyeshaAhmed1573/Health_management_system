import { AIChat } from "@/components/chat/AIChat";
import { useLocation } from "wouter";

export default function AIChatPage() {
  const [, navigate] = useLocation();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt;

  const handleNavigate = (screen) => {
    if (screen === "symptoms") {
      navigate("/symptoms");
    } else if (screen === "firstaid") {
      navigate("/firstaid");
    } else if (screen === "bmi") {
      navigate("/bmi");
    } else if (screen === "report") {
      navigate("/report");
    } else if (screen === "doctors") {
      navigate("/doctors");
    } else if (screen === "chat-center") {
      navigate("/chat-center");
    }
  };

  return <AIChat onNavigate={handleNavigate} initialPrompt={initialPrompt} />;
}
