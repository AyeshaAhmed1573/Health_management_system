import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Download,
  Sparkles,
  TrendingUp,
  RotateCw,
  Check,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  FileText,
  Calendar,
  ShieldAlert,
} from "lucide-react";

export default function ReportDetail({ reportId, open, onOpenChange, onCompare }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ["reports", "detail", reportId],
    queryFn: async () => {
      if (!reportId) return null;
      const res = await fetch(`/api/reports/${reportId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch report detail");
      return res.json();
    },
    enabled: Boolean(reportId && open),
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/reports/${reportId}/analyze`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to re-analyze report");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reports", "detail", reportId] });
      queryClient.invalidateQueries({ queryKey: ["reports", "category"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "folders"] });
      toast({
        title: "Re-analysis Complete",
        description: "Updated AI analysis with key highlights.",
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Failed to re-analyze report",
        variant: "destructive",
      });
    },
  });

  if (!open) return null;

  const getOverallStatusStyle = (status) => {
    switch (status) {
      case "Normal":
        return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
      case "Needs Attention":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30";
      case "Concerning":
        return "bg-orange-500/15 text-orange-700 border-orange-500/30";
      case "Critical":
        return "bg-red-500/15 text-red-700 border-red-500/30";
      default:
        return "bg-slate-500/15 text-slate-700 border-slate-500/30";
    }
  };

  const getHighlightStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return {
          style: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <Check className="w-3.5 h-3.5 text-emerald-600 inline-block mr-1" />,
        };
      case "low":
        return {
          style: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <ArrowDown className="w-3.5 h-3.5 text-amber-600 inline-block mr-1" />,
        };
      case "high":
        return {
          style: "bg-orange-50 text-orange-700 border-orange-200",
          icon: <ArrowUp className="w-3.5 h-3.5 text-orange-600 inline-block mr-1" />,
        };
      case "critical":
        return {
          style: "bg-red-50 text-red-700 border-red-200 font-bold",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 inline-block mr-1" />,
        };
      default:
        return {
          style: "bg-slate-50 text-slate-700 border-slate-200",
          icon: null,
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        {isLoading || !report ? (
          <div className="py-20 text-center text-secondary-foreground font-medium">
            Loading report analysis details...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section 1: Header */}
            <div className="border-b border-border/50 pb-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {report.category}
                    </span>
                    <span className="text-xs text-secondary-foreground flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {report.createdAt ? format(new Date(report.createdAt), "dd/MM/yyyy") : "N/A"}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold font-display text-foreground">{report.title}</h2>
                  <p className="text-xs text-secondary-foreground mt-0.5">
                    File: {report.fileName} ({(report.fileSize / 1024).toFixed(1)} KB)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {report.aiOverallStatus && (
                    <div
                      className={`px-4 py-2 rounded-2xl border text-sm font-bold shadow-sm ${getOverallStatusStyle(
                        report.aiOverallStatus
                      )}`}
                    >
                      Status: {report.aiOverallStatus}
                    </div>
                  )}

                  {report.fileUrl && (
                    <Button
                      onClick={() => window.open(report.fileUrl, "_blank")}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: AI Summary */}
            <div className="bg-secondary/40 p-5 rounded-2xl border border-border/50">
              <h3 className="text-base font-bold font-display text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> What This Report Says
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {report.aiSummary || "No summary available for this report."}
              </p>
            </div>

            {/* Section 3: Key Values Table */}
            {report.aiHighlights && report.aiHighlights.length > 0 && (
              <div>
                <h3 className="text-base font-bold font-display text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Key Extracted Values
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-border/60">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/60 text-secondary-foreground text-xs uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Parameter</th>
                        <th className="p-3">Value</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Normal Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {report.aiHighlights.map((item, idx) => {
                        const badgeInfo = getHighlightStatusBadge(item.status);
                        return (
                          <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3 font-semibold text-foreground">{item.label}</td>
                            <td className="p-3 font-bold text-foreground">{item.value}</td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeInfo.style}`}
                              >
                                {badgeInfo.icon}
                                {item.status ? item.status.toUpperCase() : "N/A"}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-secondary-foreground font-medium">
                              {item.normalRange || "Standard reference"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 4: AI Recommendations */}
            {report.aiRecommendations && report.aiRecommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold font-display text-foreground">AI Recommendations</h3>
                <ul className="space-y-2">
                  {report.aiRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Disclaimer:</strong> AI generated analysis is for informational purposes only.
                    Please consult your doctor for medical advice.
                  </span>
                </div>
              </div>
            )}

            {/* Section 5: Footer Actions */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-4">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onCompare(report.category);
                }}
                variant="outline"
                className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-2"
              >
                <TrendingUp className="w-4 h-4" /> Compare with Previous Reports
              </Button>

              <Button
                onClick={() => reanalyzeMutation.mutate()}
                disabled={reanalyzeMutation.isPending}
                className="btn-primary-gradient rounded-xl gap-2 font-medium"
              >
                <RotateCw className={`w-4 h-4 ${reanalyzeMutation.isPending ? "animate-spin" : ""}`} />
                {reanalyzeMutation.isPending ? "Re-analyzing..." : "Re-analyze Report"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
