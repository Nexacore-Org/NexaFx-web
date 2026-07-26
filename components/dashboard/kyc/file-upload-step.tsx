"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadStepProps {
  title: string;
  guideline: string;
  onFileSelect: (file: File | null) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function FileUploadStep({
  title,
  guideline,
  onFileSelect,
  onContinue,
  onBack,
}: FileUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast({
          title: "File rejected",
          description: "File must be a JPG, PNG, or PDF under 5MB.",
          variant: "destructive",
        });
        return;
      }

      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    },
    [toast, onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "application/pdf": [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? "border-primary bg-muted" : "border-border"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drag & drop a file here, or click to select a file</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG, PDF (max 5MB)
          </p>
        </div>
      </div>

      {preview && (
        <div className="mt-4 relative">
          <img
            src={preview}
            alt="File preview"
            className="max-h-64 rounded-lg mx-auto"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={removeFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {file && !preview && (
        <div className="mt-4 text-center">
          <p>Selected file: {file.name}</p>
          <Button variant="link" onClick={removeFile}>
            Remove
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground mt-4">{guideline}</p>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!file}>
          Continue
        </Button>
      </div>
    </div>
  );
}
