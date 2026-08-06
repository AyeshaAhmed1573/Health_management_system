import { BMICalculator } from "@/components/chat/BMICalculator";
import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";
import { patientProfilesApi } from "@/lib/api";

export default function BMICalculatorPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    try {
      const data = await patientProfilesApi.getByUser(user._id);
      if (data.profiles) {
        setProfiles(data.profiles);
        setActiveProfile(data.profiles[0]);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  return <BMICalculator profileId={activeProfile?._id} />;
}
