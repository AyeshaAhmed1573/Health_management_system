import { PageHeader } from "@/components/ui/PageHeader";
import { Pill, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pharmacy() {
  const mockMeds = [
    { id: 1, name: "Atorvastatin", dose: "20mg", freq: "Once daily", refills: 3, status: "Active" },
    { id: 2, name: "Lisinopril", dose: "10mg", freq: "Once daily", refills: 0, status: "Needs Renewal" },
    { id: 3, name: "Amoxicillin", dose: "500mg", freq: "Twice daily", refills: 0, status: "Completed" },
  ];

  return (
    <div>
      <PageHeader
        title="E-Pharmacy"
        description="Manage your active prescriptions and request refills easily."
        icon={Pill}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMeds.map((med) => (
            <div key={med.id} className="medical-card p-6 flex flex-col relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-2 h-full ${
                med.status === "Active" ? "bg-green-500" :
                med.status === "Needs Renewal" ? "bg-amber-500" : "bg-gray-300"
              }`} />

              <div className="flex items-start justify-between mb-4">
                <div className="bg-secondary p-3 rounded-xl">
                  <Pill className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  med.status === "Active" ? "bg-green-100 text-green-700" :
                  med.status === "Needs Renewal" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {med.status}
                </span>
              </div>

              <h3 className="font-bold text-xl mb-1">{med.name}</h3>
              <p className="text-primary font-medium text-sm mb-4">{med.dose}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium">{med.freq}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Refills left:</span>
                  <span className="font-medium">{med.refills}</span>
                </div>
              </div>

              <div className="mt-auto">
                {med.status === "Active" ? (
                  <Button className="w-full btn-primary-gradient rounded-xl" disabled={med.refills === 0}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Request Refill
                  </Button>
                ) : med.status === "Needs Renewal" ? (
                  <Button className="w-full bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl">
                    Contact Doctor
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-xl text-gray-500" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Treatment Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
