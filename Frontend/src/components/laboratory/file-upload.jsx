import { useState, useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { Button } from "./ui/button";

export function FileUpload({ label, optional = false, onChange }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      onChange?.(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange?.(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#2F3A40]">
        {label} {optional && <span className="text-[#7A8A92]">(optional)</span>}
      </label>
      
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#6FB3B5] bg-[#DCE8EE]/30"
              : "border-[#DCE8EE] hover:border-[#6FB3B5] hover:bg-[#F4F6F8]"
          }`}
        >
          <Upload className="w-8 h-8 mx-auto mb-3 text-[#6FB3B5]" />
          <p className="text-sm text-[#2F3A40] font-medium mb-1">
            Drag and drop your file here
          </p>
          <p className="text-xs text-[#7A8A92] mb-3">or</p>
          <Button
            type="button"
            variant="outline"
            className="border-[#6FB3B5] text-[#6FB3B5] hover:bg-[#6FB3B5] hover:text-white"
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>
      ) : (
        <div className="border border-[#DCE8EE] rounded-lg p-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#DCE8EE] rounded-lg flex items-center justify-center">
              <File className="w-5 h-5 text-[#6FB3B5]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#2F3A40]">{file.name}</p>
              <p className="text-xs text-[#7A8A92]">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[#7A8A92] hover:text-[#2F3A40] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
