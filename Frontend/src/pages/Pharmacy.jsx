import { PageHeader } from "@/components/ui/PageHeader";
import { Pill, RefreshCcw, CheckCircle2, MapPin, Clock, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { pharmacyService } from "@/services/apiService";

export default function Pharmacy() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await pharmacyService.getAllPharmacies({ verificationStatus: 'verified' });
        setPharmacies(data.pharmacies || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load pharmacies. Please try again later.");
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="E-Pharmacy"
          description="Find pharmacies and manage your prescriptions."
          icon={Pill}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading pharmacies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="E-Pharmacy"
          description="Find pharmacies and manage your prescriptions."
          icon={Pill}
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
        title="E-Pharmacy"
        description="Find pharmacies and manage your prescriptions."
        icon={Pill}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {pharmacies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No pharmacies available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pharmacies.map((pharmacy) => (
              <div key={pharmacy._id} className="medical-card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-secondary p-3 rounded-xl">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {pharmacy.rating?.average || "N/A"}
                  </div>
                </div>

                <h3 className="font-bold text-xl mb-1">{pharmacy.pharmacyName || "Unknown Pharmacy"}</h3>
                <p className="text-primary font-medium text-sm mb-4">{pharmacy.licenseNumber || "License not available"}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{pharmacy.address || "Address not available"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{pharmacy.operatingHours || "Hours not available"}</span>
                  </div>
                  {pharmacy.deliveryAvailable && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Truck className="w-4 h-4" />
                      <span>Delivery Available</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <Button className="w-full btn-primary-gradient rounded-xl">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Order Medicines
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
