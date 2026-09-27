"use client";

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, Image as ImageIcon, X, Sparkles, Loader2, Link2, AlertCircle, CheckCircle2 } from "lucide-react";
import { compressImage, formatBytes, isImageFile, CompressionResult } from "@/lib/imageCompression";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "banner" | "thumbnail";
  folder?: "avatars" | "banners" | "thumbnails" | "links";
  maxWidth?: number;
  maxHeight?: number;
  showUrlToggle?: boolean;
}

export default function ImageUpload({
  value = "",
  onChange,
  label,
  helperText,
  aspectRatio = "square",
  folder = "avatars",
  maxWidth = 1600,
  maxHeight = 1600,
  showUrlToggle = true,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingState, setUploadingState] = useState<"idle" | "compressing" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null);
  const [manualUrlMode, setManualUrlMode] = useState(false);
  const [directUrl, setDirectUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal directUrl if value changes externally
  React.useEffect(() => {
    setDirectUrl(value);
  }, [value]);

  const handleProcessFile = async (file: File) => {
    setErrorMessage("");
    setCompressionStats(null);

    // 1. Strict image-only validation
    if (!isImageFile(file)) {
      setErrorMessage("Only image files (JPEG, PNG, WebP, GIF) are supported.");
      setUploadingState("error");
      return;
    }

    try {
      // 2. Client-side compression
      setUploadingState("compressing");
      const compressedResult = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality: 0.84,
      });

      setCompressionStats(compressedResult);

      // 3. Upload to Cloudinary backend
      setUploadingState("uploading");
      const formData = new FormData();
      formData.append("file", compressedResult.file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image to Cloudinary.");
      }

      // 4. Success callback
      setUploadingState("success");
      onChange(data.url);
      setDirectUrl(data.url);

      // Reset success state after a brief moment
      setTimeout(() => {
        setUploadingState("idle");
      }, 4000);
    } catch (err: any) {
      console.error("Upload handler error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during upload.");
      setUploadingState("error");
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Clear input so same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    setDirectUrl("");
    setCompressionStats(null);
    setErrorMessage("");
    setUploadingState("idle");
  };

  const handleManualUrlSubmit = (newUrl: string) => {
    setDirectUrl(newUrl);
    onChange(newUrl);
  };

  // Dimension classes based on aspectRatio
  const aspectClass =
    aspectRatio === "banner"
      ? "w-full h-36 sm:h-44 rounded-2xl"
      : aspectRatio === "thumbnail"
      ? "w-20 h-20 sm:w-24 sm:h-24 rounded-xl"
      : "w-24 h-24 sm:w-28 sm:h-28 rounded-full";

  const isRound = aspectRatio === "square";

  return (
    <div className="space-y-2.5">
      {/* Label & Toggle between Upload and URL */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {showUrlToggle && (
          <button
            type="button"
            onClick={() => setManualUrlMode(!manualUrlMode)}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            {manualUrlMode ? (
              <>
                <UploadCloud className="w-3.5 h-3.5" /> Switch to File Upload
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5" /> Paste Image URL
              </>
            )}
          </button>
        )}
      </div>

      {/* Manual URL input fallback */}
      {manualUrlMode ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={directUrl}
              onChange={(e) => handleManualUrlSubmit(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            {directUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {helperText && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      ) : (
        /* Upload & Dropzone Area */
        <div className="space-y-2">
          {/* Hidden File Input strictly accepting images */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onFileInputChange}
            className="hidden"
          />

          {value ? (
            /* Current Image Preview & Controls */
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
              <div className={`relative overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 shadow-sm ${aspectClass}`}>
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    disabled={uploadingState === "compressing" || uploadingState === "uploading"}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-sm transition-all"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-purple-500" />
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    disabled={uploadingState === "compressing" || uploadingState === "uploading"}
                    onClick={handleRemove}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>

                {/* Compression stats banner if just uploaded */}
                {compressionStats && compressionStats.savingsPercent > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Compressed {formatBytes(compressionStats.originalSize)} → {formatBytes(compressionStats.compressedSize)} ({compressionStats.savingsPercent}% saved)
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (uploadingState !== "compressing" && uploadingState !== "uploading") {
                  fileInputRef.current?.click();
                }
              }}
              className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/20 scale-[1.01]"
                  : "border-gray-200 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-500/60 bg-gray-50/50 dark:bg-zinc-900/50 hover:bg-gray-50 dark:hover:bg-zinc-900"
              }`}
            >
              {uploadingState === "compressing" ? (
                <div className="flex flex-col items-center gap-2 text-center py-2">
                  <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Compressing photo...
                  </p>
                  <p className="text-xs text-gray-400">
                    Optimizing dimensions and quality before upload
                  </p>
                </div>
              ) : uploadingState === "uploading" ? (
                <div className="flex flex-col items-center gap-2 text-center py-2">
                  <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Uploading to Cloudinary...
                  </p>
                  <p className="text-xs text-gray-400">
                    Securing image asset
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      PNG, JPG, WebP, or GIF (auto-compressed before upload)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Uploading progress indicator for when an image is already showing */}
          {(uploadingState === "compressing" || uploadingState === "uploading") && value && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              <span>
                {uploadingState === "compressing"
                  ? "Compressing image on device..."
                  : "Uploading to Cloudinary..."}
              </span>
            </div>
          )}

          {/* Success Notification */}
          {uploadingState === "success" && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Photo uploaded successfully to Cloudinary!</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Upload Failed</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {helperText && !manualUrlMode && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
