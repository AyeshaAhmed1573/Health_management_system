import { Folder, FolderOpen, Upload, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const FOLDER_COLOR_MAP = {
  "CBC": "#3B82F6",
  "HbA1c": "#8B5CF6",
  "Lipid Profile": "#EF4444",
  "Liver Function Test": "#F97316",
  "Kidney Function Test": "#EAB308",
  "Thyroid Profile": "#6FB3B5",
  "Blood Sugar": "#EC4899",
  "Urine Test": "#22C55E",
  "Stool Test": "#92400E",
  "Hormone Test": "#F43F5E",
  "Vitamins & Minerals": "#84CC16",
  "Cardiac Markers": "#DC2626",
  "Coagulation Test": "#6366F1",
  "Infection & Microbiology": "#06B6D4",
  "Tumor Markers": "#6B7280",
  "X-Ray": "#64748B",
  "CT Scan": "#64748B",
  "MRI": "#64748B",
  "Ultrasound": "#64748B",
  "Other": "#9CA3AF",
};

export default function ReportFolders({ folders, onSelectCategory, onOpenUpload }) {
  const categoryKeys = Object.keys(folders || {});

  if (!folders || categoryKeys.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border/80 p-12 rounded-3xl text-center my-6 shadow-sm">
        <div className="w-20 h-20 bg-secondary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
          <FolderOpen className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold font-display text-foreground mb-2">No reports yet</h3>
        <p className="text-secondary-foreground text-sm max-w-md mx-auto mb-6">
          Upload your first report to automatically categorize, analyze with AI, and track trends over time.
        </p>
        <Button onClick={onOpenUpload} className="btn-primary-gradient rounded-xl px-6 py-3 font-medium">
          <Upload className="w-4 h-4 mr-2" /> Upload First Report
        </Button>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Normal":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Needs Attention":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Concerning":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Critical":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
      {categoryKeys.map((category) => {
        const folderData = folders[category];
        const color = FOLDER_COLOR_MAP[category] || FOLDER_COLOR_MAP.Other;
        const formattedDate = folderData.latestDate
          ? format(new Date(folderData.latestDate), "dd/MM/yyyy")
          : "N/A";

        return (
          <div
            key={category}
            onClick={() => onSelectCategory(category)}
            className="medical-card p-6 cursor-pointer group hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Folder className="w-8 h-8" style={{ color }} />
                </div>
                {folderData.latestStatus && (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadgeClass(
                      folderData.latestStatus
                    )}`}
                  >
                    {folderData.latestStatus}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
                {category}
              </h3>
              <p className="text-sm text-secondary-foreground font-medium mt-1">
                {folderData.count} {folderData.count === 1 ? "report" : "reports"}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-secondary-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Latest: {formattedDate}
              </span>
              <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                Open Folder &rarr;
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
