import { ChatCenter } from "@/components/chat/ChatCenter";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/authContext";
import { useEffect } from "react";

export default function ChatCenterPage() {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/patient-login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleNavigate = (screen, data) => {
    if (screen === "ai-chat") {
      navigate("/ai-chat", { state: { initialPrompt: data } });
    } else if (screen === "doctor-chat" && data) {
      navigate("/doctor-chat", { state: { doctor: data } });
    } else if (screen === "doctors") {
      navigate("/doctors");
    } else if (screen === "symptoms") {
      navigate("/symptoms");
    } else if (screen === "firstaid") {
      navigate("/firstaid");
    } else if (screen === "bmi") {
      navigate("/bmi");
    } else if (screen === "bp") {
      navigate("/blood-pressure");
    } else if (screen === "sugar") {
      navigate("/blood-sugar");
    } else if (screen === "report") {
      navigate("/report");
    }
  };

  return <ChatCenter onNavigate={handleNavigate} userId={user?._id} />;
}
