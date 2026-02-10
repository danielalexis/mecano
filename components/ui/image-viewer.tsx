'use client';

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { isVideoFile } from '@/lib/utils';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function ImageViewer({ images, initialIndex, isOpen, onClose, onIndexChange }: ImageViewerProps) {
  const navigate = (direction: number) => {
    const newIndex = initialIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      onIndexChange(newIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, initialIndex, onClose]);

  if (!isOpen) return null;

  const currentImage = images[initialIndex];
  const isVideo = isVideoFile(currentImage);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation - Left */}
      {initialIndex > 0 && (
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 group"
        >
          <ChevronLeft className="w-8 h-8 group-active:-translate-x-1 transition-transform" />
        </button>
      )}

      {/* Main Content */}
      <div className="relative w-full h-full p-4 md:p-12 flex items-center justify-center">
        <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center">
          {isVideo ? (
            <video 
              src={currentImage} 
              controls 
              autoPlay 
              className="max-w-full max-h-[90vh] object-contain"
            />
          ) : (
            <Image
              src={currentImage}
              alt={`Viewing item ${initialIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          )}
        </div>
      </div>

      {/* Navigation - Right */}
      {initialIndex < images.length - 1 && (
        <button 
          onClick={() => navigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50 group"
        >
          <ChevronRight className="w-8 h-8 group-active:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-mono text-sm bg-black/50 px-4 py-1 rounded-full border border-white/10">
        {initialIndex + 1} / {images.length}
      </div>
    </div>
  );
}