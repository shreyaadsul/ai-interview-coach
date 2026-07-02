import React, { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function ResumeUploader({ onUploadSuccess }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file && file.type === "application/pdf") {
      onUploadSuccess(file.name, file);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
 
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl space-y-6 shadow-sm">
      <h3 className="text-base font-bold text-textPrimary">Upload Your Resume</h3>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full py-12 px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer text-center space-y-4
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-200 hover:border-primary/45 hover:bg-primary/5 bg-gray-50'
          }
        `}
        onClick={handleButtonClick}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        <div className="p-4 rounded-2xl bg-primary/5 text-primary border border-primary/10">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <p className="text-textPrimary font-bold text-base">
            Drag & drop your resume here
          </p>
          <p className="text-textSecondary text-xs">OR</p>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); 
              handleButtonClick();
            }}
            className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-sm"
          >
            Choose File
          </button>
        </div>

        <p className="text-textSecondary text-xs">
          Supports PDF format only
        </p>
      </div>
    </div>
  );
}
