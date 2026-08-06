import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { categorizeReport } from "@/utils/reportCategorizer";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadCloud, File, Sparkles, Loader2, Plus, UserCheck } from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

// Initialize pdfjs worker location
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const CATEGORIES = [
  "CBC",
  "HbA1c",
  "Lipid Profile",
  "Liver Function Test",
  "Kidney Function Test",
  "X-Ray",
  "CT Scan",
  "MRI",
  "Ultrasound",
  "Thyroid Profile",
  "Urine Test",
  "Blood Sugar",
  "Stool Test",
  "Hormone Test",
  "Vitamins & Minerals",
  "Cardiac Markers",
  "Inflammation & Autoimmune",
  "Infection & Microbiology",
  "Tumor Markers",
  "Coagulation Test",
  "Nuclear Medicine",
  "Biopsy & Pathology",
  "Other",
];

export default function ReportUpload({ open, onOpenChange, profiles, activeProfileId }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [detectedCategory, setDetectedCategory] = useState("Other");
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [notes, setNotes] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Sync default profile when profiles list loads or changes
  useEffect(() => {
    if (activeProfileId) {
      setSelectedProfileId(activeProfileId);
    } else if (profiles && profiles.length > 0) {
      setSelectedProfileId(profiles[0].id || profiles[0]._id);
    }
  }, [activeProfileId, profiles]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);

      // Extract title without extension
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExt);

      // Auto-detect category
      const autoCat = categorizeReport(selectedFile.name);
      setDetectedCategory(autoCat);
      setSelectedCategory(autoCat);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Extract text from PDF or Image
  const extractTextFromFile = async (fileObj) => {
    const fileType = fileObj.type;

    try {
      if (fileType === "application/pdf") {
        setStatusMessage("Extracting text from PDF document...");
        const arrayBuffer = await fileObj.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        return fullText.trim();
      } else if (fileType.startsWith("image/")) {
        setStatusMessage("Performing OCR on report image...");
        const result = await Tesseract.recognize(fileObj, "eng");
        return result.data.text.trim();
      }
    } catch (err) {
      console.warn("Text extraction warning:", err);
    }

    return "";
  };

  // Convert File to Base64
  const fileToBase64 = (fileObj) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileObj);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Auto-create a patient profile if none exists
  const ensureProfileId = async () => {
    let pid = selectedProfileId || activeProfileId || profiles?.[0]?.id || profiles?.[0]?._id;
    if (pid) return pid;

    // Try to fetch existing profiles first
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id || user.id;
    
    if (userId) {
      try {
        const res = await fetch(`http://localhost:5000/api/profiles/user/${userId}`, {
          headers: { ...(token && { "Authorization": `Bearer ${token}` }) },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.patientProfiles && data.patientProfiles.length > 0) {
            const existingId = data.patientProfiles[0]._id || data.patientProfiles[0].id;
            return existingId;
          }
        }
      } catch (e) {
        console.error('Failed to fetch existing profiles:', e);
      }
    }

    // Only create a new profile if absolutely necessary
    setStatusMessage("Creating patient profile...");
    const profileName = newProfileName.trim() || "My Health Record";
    
    const res = await fetch("http://localhost:5000/api/profiles", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: JSON.stringify({ 
        name: profileName, 
        relationship: "self",
        userId: userId 
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Please create a patient profile first in Family Profiles.");
    }

    const data = await res.json();
    const createdId = data.patientProfile?._id || data.patientProfile?.id || data._id || data.id;
    queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
    return createdId;
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    if (!title.trim()) {
      toast({ title: "Error", description: "Please provide a report title.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      // Ensure we have a valid profileId (auto-create if needed)
      const currentProfileId = await ensureProfileId();
      if (!currentProfileId) {
        throw new Error("Patient profile is required to attach report.");
      }

      // Step 1: Base64 data URL
      const fileUrlData = await fileToBase64(file);

      // Step 2: Extract text via PDF.js or Tesseract.js
      const extractedText = await extractTextFromFile(file);

      // Step 3: Send POST to backend
      setStatusMessage("Analyzing report with AI...");

      const ext = file.name.split(".").pop().toLowerCase();
      const payload = {
        title,
        profileId: currentProfileId,
        notes,
        fileUrl: fileUrlData,
        publicId: `reports/${currentProfileId}/${Date.now()}_${file.name}`,
        fileName: file.name,
        fileType: ext,
        fileSize: file.size,
        extractedText,
      };

      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload report.");
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["reports", "folders", currentProfileId] });
      queryClient.invalidateQueries({ queryKey: ["reports", "category", currentProfileId, selectedCategory] });

      toast({
        title: "Success!",
        description: "Report uploaded and analyzed successfully.",
      });

      // Reset and close
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error("Upload failed:", err);
      toast({
        title: "Upload Failed",
        description: err.message || "An error occurred while uploading the report.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setStatusMessage("");
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDetectedCategory("Other");
    setSelectedCategory("Other");
    setNotes("");
    setNewProfileName("");
  };

  const hasProfiles = profiles && profiles.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isUploading) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[550px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-primary" /> Upload Medical Report
          </DialogTitle>
          <DialogDescription>
            Upload your PDF or image report to automatically categorize, store, and analyze key values with AI.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUploadSubmit} className="space-y-5 mt-2">
          {/* Step 1: Dropzone */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Report File</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-border/80 hover:border-primary/50 hover:bg-secondary/20"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
                      <File className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground truncate max-w-[260px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-secondary-foreground font-medium">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Selected
                  </span>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <UploadCloud className="w-10 h-10 text-primary mx-auto opacity-80" />
                  <p className="text-sm font-semibold text-foreground">
                    {isDragActive ? "Drop your file here..." : "Drag & drop report or click to browse"}
                  </p>
                  <p className="text-xs text-secondary-foreground">
                    Supports PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Category auto-detection badge */}
            {file && (
              <div className="mt-3 flex items-center justify-between text-xs bg-[#6FB3B5]/15 p-2.5 rounded-xl border border-[#6FB3B5]/30">
                <span className="font-semibold text-[#2F3A40]">Category Auto-Detected:</span>
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{detectedCategory}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Form Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Report Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Blood Test Report Jan 2025"
                className="rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-secondary-foreground mt-0.5 block">
                  Auto-detected — change if incorrect
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Patient Profile</label>
                {hasProfiles ? (
                  <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    <SelectTrigger className="rounded-xl">
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
                ) : (
                  <Input
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Profile name (e.g. Self)"
                    className="rounded-xl"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any personal doctor notes or context..."
                className="rounded-xl h-20 resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || !file}
            className="w-full btn-primary-gradient rounded-xl py-6 font-bold text-base shadow-md"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {statusMessage || "Processing with AI..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Upload & Analyze Report
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
