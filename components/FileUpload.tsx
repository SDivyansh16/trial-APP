import React, { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const { t } = useLanguage();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-surface backdrop-blur-xl p-8 rounded-xl shadow-lg border border-border-color">
        <h2 className="text-3xl font-bold text-text-primary mb-4">{t('uploadTitle')}</h2>
        <p className="text-text-secondary mb-8">
          {t('uploadInstructions')}
        </p>

        <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragActive ? 'border-primary bg-indigo-900/20' : 'border-gray-600 bg-background hover:bg-gray-900'}`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className={`w-10 h-10 mb-3 ${dragActive ? 'text-primary' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">{t('clickToUpload')}</span> {t('dragAndDrop')}
              </p>
              <p className="text-xs text-text-secondary">{t('fileType')}</p>
            </div>
          </label>
          <input id="dropzone-file" type="file" className="hidden" accept=".csv" onChange={handleChange} disabled={isLoading} />
          {dragActive && <div className="absolute top-0 left-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
        </form>

        {isLoading && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            <p className="text-text-secondary">{t('loadingText')}</p>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-500/50">
            <p className="font-semibold">{t('errorPrefix')}</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
