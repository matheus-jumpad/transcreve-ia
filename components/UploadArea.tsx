import React, { useCallback, useState } from 'react';
import { FileData } from '../types';

interface UploadAreaProps {
  onFileSelect: (fileData: FileData) => void;
  disabled: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file) return;
    
    // Simple validation for audio/video
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert("Por favor, envie apenas arquivos de áudio ou vídeo.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onFileSelect({
      file,
      previewUrl,
      mimeType: file.type
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-6 cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-600 hover:border-indigo-400 bg-slate-800/50 hover:bg-slate-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept="audio/*,video/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center text-center space-y-4 pointer-events-none">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20' : 'bg-slate-700/50'}`}>
          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium text-slate-200">
            {isDragging ? 'Solte o arquivo aqui' : 'Arraste & solte seu áudio ou vídeo'}
          </p>
          <p className="text-sm text-slate-400">
            Suporta MP3, WAV, MP4, MPEG (Max 500MB*)
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-indigo-300 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors">
          Ou clique para selecionar
        </button>
      </div>
    </div>
  );
};

export default UploadArea;