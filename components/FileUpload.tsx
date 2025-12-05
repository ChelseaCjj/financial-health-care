import React, { useCallback, useState } from 'react';
import { FileData, Language } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
  lang: Language;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, lang }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: "Feed Me Data!",
      subtitle: "Drop your PDF report here for Dr. Meow",
      button: "Select File",
      error: "Only PDF files are tasty (supported)!"
    },
    zh: {
      title: "投喂财报！",
      subtitle: "把 PDF 扔进来，喵博士来帮你体检",
      button: "选择文件",
      error: "喵？我只吃 PDF 文件哦！"
    }
  };

  const text = t[lang];

  const processFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError(text.error);
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      const base64Data = base64String.split(',')[1];
      
      onFileSelect({
        base64: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [text.error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto transform transition-all hover:scale-[1.02]">
      <div
        className={`
          relative border-4 border-dashed rounded-[2rem] p-10 text-center transition-all duration-300
          flex flex-col items-center justify-center min-h-[320px] cursor-pointer shadow-sm
          ${isDragging 
            ? 'border-orange-400 bg-orange-50 scale-105' 
            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <div className="bg-orange-100 p-6 rounded-full mb-6 relative group">
            <span className="text-5xl group-hover:scale-110 transition-transform block">📂</span>
            <span className="absolute -bottom-2 -right-2 text-3xl animate-bounce delay-700">🐱</span>
        </div>
        
        <h3 className="text-2xl font-black text-slate-700 mb-2">{text.title}</h3>
        <p className="text-slate-500 mb-8 font-medium">{text.subtitle}</p>
        
        <button className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-slate-700 transition active:scale-95 flex items-center gap-2">
          <span>🐾</span> {text.button}
        </button>

        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-600 rounded-2xl text-center font-bold animate-bounce shadow-sm border-2 border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;