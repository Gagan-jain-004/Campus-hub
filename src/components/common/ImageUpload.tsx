'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';

interface ImageUploadProps {
  images?: string[];
  value?: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxFiles?: number;
  folder?: string;
  label?: string;
  description?: string;
  helperText?: string;
  isAvatar?: boolean;
}

export function ImageUpload({
  images: propImages,
  value,
  onChange,
  maxImages = 4,
  maxFiles,
  folder = 'campushub_uploads',
  label = 'Upload Images',
  description: propDesc,
  helperText,
  isAvatar = false,
}: ImageUploadProps) {
  const images = value || propImages || [];
  const effectiveMaxImages = maxFiles || maxImages;
  const description = helperText || propDesc || 'PNG, JPG or WEBP (Max 10MB per image)';

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > effectiveMaxImages) {
      setError(`You can only upload up to ${effectiveMaxImages} images.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('folder', folder);

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          setError('Only image files (JPG, PNG, WEBP) are allowed.');
          setUploading(false);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError('File size exceeds 10MB limit.');
          setUploading(false);
          return;
        }
        formData.append('files', file);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.urls) {
        if (isAvatar) {
          onChange([data.urls[0]]);
        } else {
          onChange([...images, ...data.urls]);
        }
      } else {
        setError(data.error || 'Failed to upload images.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload failed. Please check network/Cloudinary credentials.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  // Avatar-specific layout
  if (isAvatar) {
    const currentAvatar = images[0];
    return (
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center shrink-0">
            {currentAvatar ? (
              <Image
                src={currentAvatar}
                alt="Avatar"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-subtle cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{currentAvatar ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
            <p className="text-[11px] text-slate-400">{description}</p>
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }

  // Multi-image upload layout (for Marketplace & Lost-Found)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} ({images.length}/{effectiveMaxImages})
        </label>
        <span className="text-[11px] text-slate-400">{description}</span>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Grid of uploaded images + upload button */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((imgUrl, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group shadow-xs"
          >
            <Image
              src={imgUrl}
              alt={`Uploaded preview ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-mono text-white font-semibold">
                Cover
              </span>
            )}
          </div>
        ))}

        {images.length < effectiveMaxImages && (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/80 dark:hover:border-primary/80 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer group ${
              uploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={effectiveMaxImages > 1}
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-1.5 text-primary">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-medium">Uploading to Cloudinary...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary shadow-xs group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Add Photo</span>
                <span className="text-[10px] text-slate-400">Click to browse</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
