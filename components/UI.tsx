import React, { useRef } from 'react';
import { useStore } from '../store';

export const UI: React.FC = () => {
  const { mode, toggleMode, addPhotos, userPhotos } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userPhotos.length >= 10) return;

    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const urls = files.map(file => URL.createObjectURL(file as Blob));
      addPhotos(urls);
      // Reset input
      e.target.value = '';
    }
  };

  const isFull = userPhotos.length >= 10;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <div className="text-center mt-4">
        <h1 className="font-['Cinzel'] text-3xl md:text-5xl text-[#D4AF37] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          ARIX
        </h1>
        <p className="font-['Playfair_Display'] text-[#8FBC8F] text-xs md:text-sm tracking-[0.3em] uppercase mt-2">
          Christmas Memories
        </p>
      </div>

      {/* Controls */}
      <div className="pointer-events-auto flex flex-col items-center gap-4 mb-8">
        
        {/* Toggle State Button */}
        <button
          onClick={toggleMode}
          className="group relative px-8 py-3 bg-[#011a10]/80 backdrop-blur-md border border-[#c5a059]/30 rounded-full overflow-hidden transition-all duration-500 hover:border-[#c5a059] hover:bg-[#022b1b]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c5a059]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="font-['Cinzel'] text-[#D4AF37] text-sm md:text-base tracking-widest">
            {mode === 'SCATTERED' ? 'ASSEMBLE TREE' : 'SCATTER ELEMENTS'}
          </span>
        </button>

        {/* Upload Button - Prominent Style */}
        <div className="relative">
            <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                disabled={isFull}
            />
            <button 
                onClick={() => !isFull && fileInputRef.current?.click()}
                disabled={isFull}
                className={`flex items-center gap-2 px-6 py-2 bg-[#D4AF37]/10 border border-[#D4AF37] rounded-sm text-[#D4AF37] transition-all duration-300 font-['Playfair_Display'] text-sm uppercase tracking-widest shadow-[0_0_10px_rgba(212,175,55,0.2)] ${
                  isFull 
                    ? 'opacity-50 cursor-not-allowed border-gray-500 text-gray-400 bg-gray-900/10 shadow-none' 
                    : 'hover:bg-[#D4AF37] hover:text-[#010b07]'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                {isFull ? 'Limit Reached' : `Add Memories (${userPhotos.length}/10)`}
            </button>
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-[#c5a059]/40 opacity-50" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t border-r border-[#c5a059]/40 opacity-50" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b border-l border-[#c5a059]/40 opacity-50" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-[#c5a059]/40 opacity-50" />
    </div>
  );
};