import { PageHeader } from "@/components/ui/PageHeader";
import { UserCircle, Star, Calendar, X, Phone, Mail, Clock, Stethoscope, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { doctorService } from "@/services/apiService";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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
              <div
                key={doc._id}
                className="medical-card overflow-hidden group flex flex-col cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setSelectedDoctor(doc)}
              >
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
                    <Calendar className="w-4 h-4 mr-2" /> View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              <div className="h-48 overflow-hidden bg-secondary">
                <img
                  src={selectedDoctor.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80"}
                  alt={selectedDoctor.userId?.name || "Doctor"}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 bg-card/90 backdrop-blur p-2 rounded-full hover:bg-card transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedDoctor.userId?.name || "Unknown Doctor"}</h2>
                  <p className="text-primary font-medium">{selectedDoctor.specialization || "General Practice"}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{selectedDoctor.rating?.average || "N/A"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="font-semibold">{selectedDoctor.experienceYears || 0} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Qualification</p>
                    <p className="font-semibold">{selectedDoctor.qualification || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Hospital Location */}
                {selectedDoctor.hospital && (selectedDoctor.hospital.name || selectedDoctor.hospital.address) && (
                  <div className="p-3 bg-secondary rounded-xl">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Hospital
                    </h4>
                    <div className="space-y-1 text-sm">
                      {selectedDoctor.hospital.name && (
                        <p className="font-medium">{selectedDoctor.hospital.name}</p>
                      )}
                      {selectedDoctor.hospital.address && (
                        <p className="text-muted-foreground">{selectedDoctor.hospital.address}</p>
                      )}
                      {(selectedDoctor.hospital.city || selectedDoctor.hospital.phone) && (
                        <p className="text-muted-foreground">
                          {selectedDoctor.hospital.city && selectedDoctor.hospital.city}
                          {selectedDoctor.hospital.city && selectedDoctor.hospital.phone && ' • '}
                          {selectedDoctor.hospital.phone && selectedDoctor.hospital.phone}
                        </p>
                      )}
                      {selectedDoctor.hospital.workingHours && (
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedDoctor.hospital.workingHours}
                        </p>
                      )}
                      {selectedDoctor.hospital.consultationFee && (
                        <p className="text-primary font-semibold">
                          Fee: PKR {selectedDoctor.hospital.consultationFee}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Clinic Location */}
                {selectedDoctor.clinic && (selectedDoctor.clinic.name || selectedDoctor.clinic.address) && (
                  <div className="p-3 bg-secondary rounded-xl">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Clinic
                    </h4>
                    <div className="space-y-1 text-sm">
                      {selectedDoctor.clinic.name && (
                        <p className="font-medium">{selectedDoctor.clinic.name}</p>
                      )}
                      {selectedDoctor.clinic.address && (
                        <p className="text-muted-foreground">{selectedDoctor.clinic.address}</p>
                      )}
                      {(selectedDoctor.clinic.city || selectedDoctor.clinic.phone) && (
                        <p className="text-muted-foreground">
                          {selectedDoctor.clinic.city && selectedDoctor.clinic.city}
                          {selectedDoctor.clinic.city && selectedDoctor.clinic.phone && ' • '}
                          {selectedDoctor.clinic.phone && selectedDoctor.clinic.phone}
                        </p>
                      )}
                      {selectedDoctor.clinic.workingHours && (
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedDoctor.clinic.workingHours}
                        </p>
                      )}
                      {selectedDoctor.clinic.consultationFee && (
                        <p className="text-primary font-semibold">
                          Fee: PKR {selectedDoctor.clinic.consultationFee}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Details */}
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{selectedDoctor.userId?.phone || "Not available"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">{selectedDoctor.userId?.email || "Not available"}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Dr. {selectedDoctor.userId?.name} is a qualified {selectedDoctor.specialization || "medical professional"}
                  with {selectedDoctor.experienceYears || 0} years of experience. They are committed to providing
                  high-quality healthcare services to patients.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-xl">
                  <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl">
                  <Phone className="w-4 h-4 mr-2" /> Call Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
