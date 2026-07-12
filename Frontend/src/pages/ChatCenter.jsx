import { ChatCenter } from "@/components/chat/ChatCenter";
import { useLocation } from "wouter";

export default function ChatCenterPage() {
  const [, navigate] = useLocation();

  const handleNavigate = (screen, data) => {
    if (screen === "ai-chat") {
      navigate("/ai-chat", { state: { initialPrompt } });
    } else if (screen === "doctor-chat" && data) {
      navigate("/doctor-chat", { state: { doctor } });
    } else if (screen === "doctors") {
      navigate("/doctors");
    } else if (screen === "symptoms") {
      navigate("/symptoms");
    } else if (screen === "firstaid") {
      navigate("/firstaid");
    } else if (screen === "bmi") {
      navigate("/bmi");
    } else if (screen === "report") {
      navigate("/report");
    }
  };

  return <ChatCenter onNavigate={handleNavigate} />;
}
