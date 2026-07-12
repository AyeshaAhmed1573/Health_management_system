import { PageHeader } from "@/components/ui/PageHeader";
import { Activity, Download, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Lab() {
  const mockResults = [
    { id: "L-8821", test: "Complete Blood Count", date: "Oct 24, 2024", status: "Normal", doctor: "Dr. Wilson" },
    { id: "L-8822", test: "Lipid Panel", date: "Oct 24, 2024", status: "Review", doctor: "Dr. Jenkins" },
    { id: "L-8815", test: "Thyroid Profile", date: "Jul 12, 2024", status: "Normal", doctor: "Dr. Jenkins" },
    { id: "L-8702", test: "Metabolic Panel", date: "Jan 05, 2024", status: "Normal", doctor: "Dr. Wilson" },
  ];

  return (
    <div>
      <PageHeader
        title="Laboratory Results"
        description="Access and download your recent diagnostic test reports."
        icon={Activity}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="medical-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-foreground font-display font-semibold border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">Test ID</th>
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ordered By</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {mockResults.map((result) => (
                  <tr key={result.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground">{result.id}</td>
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {result.test}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{result.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${result.status === "Normal" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
                      `}>
                        {result.status === "Review" && <AlertCircle className="w-3 h-3" />}
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{result.doctor}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                        <Download className="w-4 h-4 mr-2" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
