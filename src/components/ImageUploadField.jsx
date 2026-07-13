import React, { useState, useRef } from 'react';
import { Upload, X, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ImageUploadField({
  value,
  onChange,
  onDelete,
  label = "Upload Image",
  recommendedWidth = 800,
  recommendedHeight = 600
}) {
  const [dragActive, setDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  // Compress & crop/resize image client-side using HTML5 Canvas
  const processImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file.');
    }

    setCompressing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Perform center crop and scaling to fit recommended proportions
        const targetWidth = recommendedWidth;
        const targetHeight = recommendedHeight;
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        // Draw image, resizing it to cover target dimensions (aspect cover)
        const imgRatio = width / height;
        const targetRatio = targetWidth / targetHeight;
        
        let sx = 0, sy = 0, sWidth = width, sHeight = height;

        if (imgRatio > targetRatio) {
          // Image is wider than target: trim left/right sides
          sWidth = height * targetRatio;
          sx = (width - sWidth) / 2;
        } else if (imgRatio < targetRatio) {
          // Image is taller than target: trim top/bottom sides
          sHeight = width / targetRatio;
          sy = (height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        // Compress output to JPEG at 80% quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        onChange(compressedBase64);
        setCompressing(false);
        toast.success(`Image processed & optimized to size!`);
      };
      
      img.onerror = () => {
        setCompressing(false);
        toast.error('Failed to load image.');
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current.click();
  };

  const calculateSize = (base64Str) => {
    if (!base64Str) return '0 KB';
    const stringLength = base64Str.length - 'data:image/jpeg;base64,'.length;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.562489; // approximate size
    const sizeInKb = (sizeInBytes / 1024).toFixed(1);
    return `${sizeInKb} KB`;
  };

  return (
    <div className="w-full flex flex-col items-start gap-2 select-none">
      {label && (
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        /* Image Preview Box */
        <div className="w-full relative border border-gray-200/60 rounded-2xl overflow-hidden group/image bg-gray-50 flex flex-col items-center">
          <div className="w-full h-44 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
            <img
              src={value}
              alt="Uploaded Banner Preview"
              className="max-w-full max-h-full object-contain"
            />
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={triggerInput}
                className="p-2.5 bg-white text-gray-700 hover:text-primary-green rounded-xl transition shadow-md hover:scale-105 cursor-pointer"
                title="Replace Image"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="p-2.5 bg-white text-red-500 hover:bg-red-50 rounded-xl transition shadow-md hover:scale-105 cursor-pointer"
                  title="Remove Image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="w-full px-4 py-2 flex items-center justify-between bg-white text-[11px] text-gray-400 font-semibold">
            <span>Dimensions: {recommendedWidth} x {recommendedHeight} px</span>
            <span>Est. Size: {calculateSize(value)}</span>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
            dragActive
              ? 'border-primary-green bg-light-green/20'
              : 'border-gray-200 hover:border-primary-green/60 bg-gray-50/50 hover:bg-white'
          }`}
        >
          {compressing ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-[12px] font-semibold text-gray-400">Processing & scaling image...</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-light-green text-primary-green flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-gray-700">Drag & Drop or Click to Upload</p>
                <p className="text-[11px] font-medium text-gray-400 mt-1">
                  Supports JPEG, PNG • Recommend {recommendedWidth}x{recommendedHeight} px
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
