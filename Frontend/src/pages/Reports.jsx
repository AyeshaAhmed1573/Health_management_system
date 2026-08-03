import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProfiles } from "@/hooks/use-profiles";
import { PageHeader } from "@/components/ui/PageHeader";
import { FileText, Upload, Folder, ArrowLeft, Users, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReportFolders from "@/components/reports/ReportFolders";
import ReportList from "@/components/reports/ReportList";
import ReportUpload from "@/components/reports/ReportUpload";
import ReportDetail from "@/components/reports/ReportDetail";
import ComparisonGraph from "@/components/reports/ComparisonGraph";

export default function Reports() {
  const [view, setView] = useState("folders"); // 'folders' | 'list'
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailReportId, setDetailReportId] = useState(null);
  const [compareCategory, setCompareCategory] = useState(null);

  // Profiles query
  const { data: profiles, isLoading: isLoadingProfiles } = useProfiles();
  const [activeProfileId, setActiveProfileId] = useState("");

  // Effective profile ID fallback
  const effectiveProfileId =
    activeProfileId ||
    (profiles && profiles.length > 0 ? profiles[0].id || profiles[0]._id : "default-profile");

  // Folders query
  const { data: folders, isLoading: isLoadingFolders } = useQuery({
    queryKey: ["reports", "folders", effectiveProfileId],
    queryFn: async () => {
      if (!effectiveProfileId || effectiveProfileId === "default-profile") return {};
      const res = await fetch(`/api/reports/folders/${effectiveProfileId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch report folders");
      return res.json();
    },
    enabled: Boolean(effectiveProfileId && effectiveProfileId !== "default-profile"),
  });

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setView("list");
  };

  const handleBackToFolders = () => {
    setView("folders");
    setSelectedCategory(null);
  };

  const currentFolderCount =
    selectedCategory && folders && folders[selectedCategory]
      ? folders[selectedCategory].count
      : 0;

  return (
    <div>
      <PageHeader
        title="My Reports"
        description="Auto-categorized medical reports with AI insights, trend graphs & folder organization."
        icon={FileText}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <span
              onClick={handleBackToFolders}
              className={`cursor-pointer hover:text-primary transition-colors ${
                view === "folders" ? "text-foreground font-bold" : "text-secondary-foreground"
              }`}
            >
              Reports
            </span>

            {view === "list" && selectedCategory && (
              <>
                <span className="text-secondary-foreground">/</span>
                <span className="text-primary font-bold">
                  {selectedCategory} ({currentFolderCount} {currentFolderCount === 1 ? "report" : "reports"})
                </span>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Profile Selector if profiles exist */}
            {profiles && profiles.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <Select
                  value={effectiveProfileId}
                  onValueChange={(val) => {
                    setActiveProfileId(val);
                    setView("folders");
                    setSelectedCategory(null);
                  }}
                >
                  <SelectTrigger className="w-[180px] rounded-xl text-xs font-semibold">
                    <SelectValue placeholder="Select Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id || p._id} value={p.id || p._id}>
                        {p.name} ({p.relationship})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={() => setUploadOpen(true)}
              className="btn-primary-gradient rounded-xl shadow-sm gap-1.5"
            >
              <Upload className="w-4 h-4" /> Upload Report
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {isLoadingProfiles || isLoadingFolders ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : view === "folders" ? (
          <ReportFolders
            folders={folders}
            onSelectCategory={handleSelectCategory}
            onOpenUpload={() => setUploadOpen(true)}
          />
        ) : (
          <ReportList
            category={selectedCategory}
            profileId={effectiveProfileId}
            onBack={handleBackToFolders}
            onUpload={() => setUploadOpen(true)}
            onViewDetail={(reportId) => setDetailReportId(reportId)}
            onCompare={(cat) => setCompareCategory(cat)}
          />
        )}
      </div>

      {/* Upload Modal */}
      <ReportUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        profiles={profiles}
        activeProfileId={effectiveProfileId !== "default-profile" ? effectiveProfileId : ""}
      />

      {/* Detail Modal */}
      <ReportDetail
        reportId={detailReportId}
        open={Boolean(detailReportId)}
        onOpenChange={(open) => !open && setDetailReportId(null)}
        onCompare={(cat) => {
          setDetailReportId(null);
          setCompareCategory(cat);
        }}
      />

      {/* Comparison Graph Modal */}
      <ComparisonGraph
        category={compareCategory}
        profileId={effectiveProfileId}
        open={Boolean(compareCategory)}
        onOpenChange={(open) => !open && setCompareCategory(null)}
      />
    </div>
  );
}
