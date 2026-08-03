import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, TrendingUp, Trash2, ArrowLeft, Upload, Sparkles, Calendar, FileText, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ReportList({ category, profileId, onBack, onUpload, onViewDetail, onCompare }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ["reports", "category", profileId, category],
    queryFn: async () => {
      const res = await fetch(`/api/reports/profile/${profileId}/category/${encodeURIComponent(category)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
    enabled: Boolean(profileId && category),
  });

  const deleteMutation = useMutation({
    mutationFn: async (reportId) => {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete report");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "folders", profileId] });
      queryClient.invalidateQueries({ queryKey: ["reports", "category", profileId, category] });
      toast({
        title: "Deleted",
        description: "Report removed successfully.",
      });
      setDeleteId(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete report",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status) => {
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

  const reportCount = reports?.length || 0;
  const canCompare = reportCount >= 2;

  return (
    <div className="space-y-6 my-6">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button onClick={onBack} variant="outline" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold font-display text-foreground">{category} Reports</h2>
            <p className="text-sm text-secondary-foreground">
              {reportCount} {reportCount === 1 ? "report" : "reports"} stored in folder
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={() => canCompare && onCompare(category)}
                  disabled={!canCompare}
                  variant="outline"
                  className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <TrendingUp className="w-4 h-4" /> Compare Trends
                </Button>
              </span>
            </TooltipTrigger>
            {!canCompare && (
              <TooltipContent>
                <p>Upload at least 2 {category} reports to enable trend comparison graph.</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Button onClick={onUpload} className="btn-primary-gradient rounded-xl gap-2">
            <Upload className="w-4 h-4" /> Upload Report
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="medical-card p-6 animate-pulse flex flex-col space-y-3">
              <div className="h-5 bg-secondary/80 rounded w-1/3" />
              <div className="h-4 bg-secondary/50 rounded w-full" />
              <div className="h-4 bg-secondary/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">Failed to load reports. Please try again.</div>
      ) : reports && reports.length > 0 ? (
        <div className="grid gap-4">
          {reports.map((report) => {
            const formattedDate = report.createdAt
              ? format(new Date(report.createdAt), "dd/MM/yyyy")
              : "N/A";
            const summaryPreview = report.aiSummary
              ? report.aiSummary.length > 120
                ? report.aiSummary.slice(0, 120) + "..."
                : report.aiSummary
              : "No AI summary generated.";

            return (
              <div
                key={report._id}
                className="medical-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold font-display text-foreground">{report.title}</h3>
                    {report.autoCategorized ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#6FB3B5]/15 text-[#2F3A40] border border-[#6FB3B5]/30">
                        Auto-detected
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Manually set
                      </span>
                    )}

                    {report.aiOverallStatus && (
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          report.aiOverallStatus
                        )}`}
                      >
                        {report.aiOverallStatus}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-secondary-foreground flex items-center gap-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Uploaded: {formattedDate} &bull; File: {report.fileName} ({(report.fileSize / 1024).toFixed(1)} KB)
                  </p>

                  <p className="text-sm text-foreground/80 bg-secondary/30 p-3 rounded-xl border border-border/40">
                    <Sparkles className="w-3.5 h-3.5 text-primary inline-block mr-1.5 -mt-0.5" />
                    {summaryPreview}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <Button
                    onClick={() => onViewDetail(report._id)}
                    variant="outline"
                    className="rounded-xl text-primary border-primary/30 hover:bg-primary/10 gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> View
                  </Button>

                  <Button
                    onClick={() => setDeleteId(report._id)}
                    variant="outline"
                    className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                    size="icon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border p-12 rounded-3xl text-center">
          <FileText className="w-12 h-12 text-secondary-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold">No reports in this category</h3>
          <p className="text-secondary-foreground text-sm mb-4">
            Upload a report for {category} to view analysis and track findings.
          </p>
          <Button onClick={onUpload} className="btn-primary-gradient rounded-xl">
            Upload {category} Report
          </Button>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report file and its AI analysis records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
