import { BloodPressure } from "@/components/chat/BloodPressure";
import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";
import { patientProfilesApi } from "@/lib/api";

export default function BloodPressurePage() {
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

  return <BloodPressure profileId={activeProfile?._id} />;
}
