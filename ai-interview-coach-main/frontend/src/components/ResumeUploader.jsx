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
      onUploadSuccess(file.name);
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
    <div className="bg-[#111827] border border-[#1F2937] p-8 rounded-2xl space-y-6 shadow-xl">
      <h3 className="text-lg font-semibold text-white">Upload Your Resume</h3>
      
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`w-full py-12 px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer text-center space-y-4
          ${isDragActive 
            ? 'border-[#7C3AED] bg-[#7C3AED]/5' 
            : 'border-[#7C3AED]/40 hover:border-[#7C3AED] hover:bg-[#7C3AED]/5 bg-navy-900/35'
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

        <div className="p-4 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 shadow-md">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <p className="text-white font-medium text-base">
            Drag & drop your resume here
          </p>
          <p className="text-gray-400 text-sm">OR</p>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering parent div click twice
              handleButtonClick();
            }}
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-[#7C3AED]/25"
          >
            Choose File
          </button>
        </div>

        <p className="text-gray-500 text-xs">
          Supports PDF format only
        </p>
      </div>
    </div>
  );
}
