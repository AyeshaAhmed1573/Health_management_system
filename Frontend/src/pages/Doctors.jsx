import { PageHeader } from "@/components/ui/PageHeader";
import { UserCircle, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { doctorService } from "@/services/apiService";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getAllDoctors({ verificationStatus: 'verified' });
        setDoctors(data.doctors || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load doctors. Please try again later.");
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Doctors Directory"
          description="Find and book appointments with top-rated medical specialists in our network."
          icon={UserCircle}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading doctors...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Doctors Directory"
          description="Find and book appointments with top-rated medical specialists in our network."
          icon={UserCircle}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Doctors Directory"
        description="Find and book appointments with top-rated medical specialists in our network."
        icon={UserCircle}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {doctors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No doctors available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div key={doc._id} className="medical-card overflow-hidden group flex flex-col">
                <div className="h-48 overflow-hidden relative bg-secondary">
                  <img
                    src={doc.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"}
                    alt={doc.userId?.name || "Doctor"}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur text-sm font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {doc.rating?.average || "N/A"}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg mb-1">{doc.userId?.name || "Unknown Doctor"}</h3>
                  <p className="text-primary font-medium text-sm mb-4">{doc.specialization || "General Practice"}</p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <UserCircle className="w-4 h-4" /> {doc.experienceYears || 0} years experience
                  </div>

                  <Button className="w-full mt-auto bg-secondary text-primary hover:bg-primary hover:text-white rounded-xl">
                    <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
