import React, { useState, useCallback, useEffect } from 'react';
import { ImageFile } from '../types';

interface FileInputProps {
  label: string;
  onFileChange: (file: ImageFile | null) => void;
  required?: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ label, onFileChange, required = false }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if(file.size > 4 * 1024 * 1024){
        alert("File is too big! Max size is 4MB.");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setFileName(file.name);
      onFileChange({ file, previewUrl });
    } else {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setFileName('');
      onFileChange(null);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);


  const handleRemove = () => {
    handleFileChange(null);
  };
  
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="w-full">
      <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">
        {label} {required && <span className="text-indigo-500">*</span>}
      </label>
      {preview ? (
        <div className="relative group rounded-2xl overflow-hidden shadow-md ring-4 ring-white">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover bg-gray-100" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white text-xs p-3 truncate font-medium">{fileName}</div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group relative flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 bg-gray-50/50 hover:bg-white hover:border-indigo-300'}`}
        >
          <div className="space-y-3 text-center">
            <div className="mx-auto h-14 w-14 text-indigo-400 group-hover:text-indigo-600 flex items-center justify-center bg-white rounded-full shadow-sm group-hover:shadow-md transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex flex-col text-sm text-gray-600">
              <label htmlFor={label} className="relative cursor-pointer rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                <span>Click to Upload</span>
                <input id={label} name={label} type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} />
              </label>
              <p className="pl-1 text-gray-400">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-400 bg-white/50 rounded-full px-2 py-1 inline-block">PNG, JPG up to 4MB</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileInput;