import { PageHeader } from "@/components/ui/PageHeader";
import { Activity, Download, FileText, AlertCircle, MapPin, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { laboratoryService } from "@/services/apiService";

export default function Lab() {
  const [laboratories, setLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        const data = await laboratoryService.getAllLaboratories({ verificationStatus: 'verified' });
        setLaboratories(data.laboratories || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load laboratories. Please try again later.");
        setLoading(false);
      }
    };

    fetchLaboratories();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Laboratories"
          description="Find and book diagnostic tests at verified laboratories."
          icon={Activity}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading laboratories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Laboratories"
          description="Find and book diagnostic tests at verified laboratories."
          icon={Activity}
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
        title="Laboratories"
        description="Find and book diagnostic tests at verified laboratories."
        icon={Activity}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {laboratories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No laboratories available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laboratories.map((lab) => (
              <div key={lab._id} className="medical-card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-secondary p-3 rounded-xl">
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {lab.rating?.average || "N/A"}
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-1">{lab.labName || "Unknown Laboratory"}</h3>
                <p className="text-primary font-medium text-sm mb-4">{lab.licenseNumber || "License not available"}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {lab.address?.street && `${lab.address.street}, `}
                      {lab.address?.city && `${lab.address.city}, `}
                      {lab.address?.province && `${lab.address.province} `}
                      {lab.address?.postalCode || "Address not available"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {lab.operatingHours?.open && `${lab.operatingHours.open} - `}
                      {lab.operatingHours?.close || lab.operatingHours || "Hours not available"}
                    </span>
                  </div>
                  {lab.homeCollection && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText className="w-4 h-4" />
                      <span>Home Collection Available</span>
                    </div>
                  )}
                </div>

                <Button className="w-full mt-auto btn-primary-gradient rounded-xl">
                  <Download className="w-4 h-4 mr-2" /> View Tests
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
