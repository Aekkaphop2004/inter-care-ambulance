import React, { useState, useRef } from 'react';
import { Upload, X, Link, FileImage, Sparkles, CheckCircle2 } from 'lucide-react';
import { compressImage, formatBytes } from '../utils/imageHelper';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}

export function ImageUploader({ value, onChange, label, placeholder = "วางลิงก์รูปภาพ หรืออัปโหลดไฟล์ที่นี่...", id }: ImageUploaderProps) {
  const [useUrlMode, setUseUrlMode] = useState(!value || value.startsWith('http'));
  const [compressing, setCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [stats, setStats] = useState<{ original: number; compressed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (.png, .jpg, .jpeg, .webp)');
      return;
    }

    setCompressing(true);
    setError(null);
    try {
      // Compress to max width 1100px, JPEG quality 0.75 for super lightweight but beautiful output
      const result = await compressImage(file, 1100, 0.75);
      onChange(result.dataUrl);
      setStats({
        original: result.originalSize,
        compressed: result.compressedSize
      });
      setUseUrlMode(false); // Stay in file mode with Base64 preview
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการบีบอัดรูปภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setCompressing(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    onChange('');
    setStats(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Determine if current value is a base64 encoded string
  const isBase64 = value && value.startsWith('data:image/');

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">{label}</label>
          <button
            type="button"
            onClick={() => {
              setUseUrlMode(!useUrlMode);
              setError(null);
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
          >
            {useUrlMode ? (
              <>
                <Upload className="w-3 h-3" />
                สลับไปอัปโหลดไฟล์รูปโดยตรง
              </>
            ) : (
              <>
                <Link className="w-3 h-3" />
                สลับไปกรอกลิงก์ URL แทน
              </>
            )}
          </button>
        </div>
      )}

      {useUrlMode ? (
        // Mode 1: URL Input
        <div className="flex gap-3 items-center">
          {value ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
              <img 
                src={value} 
                alt="Preview" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=80&q=80";
                }}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-rose-400 cursor-pointer"
                title="ลบลิงก์รูปภาพ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-center text-slate-600 flex-shrink-0">
              <Link className="w-5 h-5 opacity-40" />
            </div>
          )}
          
          <div className="flex-1">
            <input 
              id={id}
              type="url" 
              value={isBase64 ? '' : value}
              onChange={(e) => {
                onChange(e.target.value);
                setStats(null);
              }}
              placeholder={placeholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
            />
          </div>
        </div>
      ) : (
        // Mode 2: Direct File Upload & Drag-and-Drop Area
        <div className="space-y-2">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />

          {value ? (
            // Show Preview & Compression Stats
            <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img 
                  src={value} 
                  alt="Compressed Preview" 
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700 bg-slate-950 flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>บีบอัดและอัปโหลดสำเร็จ!</span>
                  </div>
                  {stats ? (
                    <div className="text-[10px] text-slate-400 mt-0.5 space-y-0.5">
                      <p>
                        ขนาดเดิม: <span className="text-slate-300 font-mono">{formatBytes(stats.original)}</span>
                      </p>
                      <p className="flex items-center gap-1 text-blue-400">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        เหลือเพียง: <span className="font-bold font-mono">{formatBytes(stats.compressed)}</span>
                        <span className="text-emerald-500 font-bold">({Math.round((1 - stats.compressed / stats.original) * 100)}% lighter!)</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-0.5">พร้อมบันทึกเข้าสู่ระบบคลาวด์แบบเบาพิเศษ</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="p-2.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-xl transition-colors border border-slate-700/60 cursor-pointer"
                title="ลบรูปภาพนี้"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Drag and drop zone
            <div
              onDragEnter={onDrag}
              onDragOver={onDrag}
              onDragLeave={onDrag}
              onDrop={onDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group min-h-[110px] ${
                dragActive 
                  ? 'border-blue-500 bg-blue-600/10' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/80'
              }`}
            >
              {compressing ? (
                <>
                  <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-blue-400 animate-pulse">กำลังประมวลผลและบีบอัดภาพให้อัตโนมัติ...</p>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:scale-105 transition-all">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">
                      <span className="text-blue-400">คลิกที่นี่</span> หรือ ลากไฟล์รูปภาพมาวางเพื่ออัปโหลด
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      ระบบจะบีบอัดรูปภาพให้เบาลงอัตโนมัติ เพื่อความรวดเร็วและไม่ทำให้เว็บหน่วง
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="text-[11px] text-rose-400 font-semibold">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
