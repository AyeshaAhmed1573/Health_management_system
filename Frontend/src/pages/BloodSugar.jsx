import { BloodSugar } from "@/components/chat/BloodSugar";
import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";
import { patientProfilesApi } from "@/lib/api";

export default function BloodSugarPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    try {
      const userId = user?._id || user?.id;
      console.log('Loading profiles for userId:', userId);
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const data = await patientProfilesApi.getAll(userId);
      if (data.patientProfiles) {
        setProfiles(data.patientProfiles);
        setActiveProfile(data.patientProfiles[0]);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  return <BloodSugar profileId={activeProfile?._id} />;
}
