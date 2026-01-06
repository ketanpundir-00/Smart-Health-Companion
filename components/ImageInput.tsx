import React, { useRef, useState } from 'react';
import { MultimediaInput } from '../types';

interface ImageInputProps {
  onImageCapture: (image: MultimediaInput | null) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({ onImageCapture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        
        // Remove 'data:image/xyz;base64,' prefix
        const base64Data = base64String.split(',')[1];
        onImageCapture({
          mimeType: file.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    onImageCapture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-start space-y-3 w-full p-4 border-2 border-dashed border-teal-200 rounded-xl bg-teal-50/50">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-semibold text-teal-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Symptom Image
        </span>
      </div>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-32 border-2 border-teal-200 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 hover:border-teal-400 transition-all group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400 group-hover:text-teal-600 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-teal-600 font-medium">Upload Photo</span>
          <span className="text-xs text-teal-400 mt-1">PNG, JPG, HEIC</span>
        </div>
      ) : (
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-teal-200">
          <img src={previewUrl} alt="Symptom preview" className="w-full h-full object-cover" />
          <button 
            onClick={handleClear}
            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-md text-gray-600 hover:text-red-500 transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
          </button>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default ImageInput;
