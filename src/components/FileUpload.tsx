import { useState, useRef } from "react";
import { Upload, Image, AudioLines, X, FileType } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const FileUpload = ({ onFileSelect, selectedFile }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      onFileSelect(file);
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg',
      'video/mp4', 'video/webm'
    ];
    return validTypes.includes(file.type);
  };

  const getFileIcon = () => {
    if (!selectedFile) return Upload;
    if (selectedFile.type.startsWith('image/')) return Image;
    if (selectedFile.type.startsWith('audio/')) return AudioLines;
    return FileType;
  };

  const FileIcon = getFileIcon();

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Upload size={16} className="text-primary" />
        Upload Media (Optional)
      </label>
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer",
          isDragging 
            ? "border-primary bg-primary/10" 
            : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
          selectedFile && "border-success/50 bg-success/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className={cn(
            "p-3 rounded-xl",
            selectedFile ? "bg-success/10" : "bg-muted/50"
          )}>
            <FileIcon 
              size={24} 
              className={selectedFile ? "text-success" : "text-muted-foreground"} 
            />
          </div>
          
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-foreground">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Images, audio, or video for deepfake detection
              </p>
            </div>
          )}
        </div>

        {selectedFile && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
          >
            <X size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
