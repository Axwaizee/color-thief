'use client';

import { useState, useRef } from 'react';
import { getColorSync, getPaletteSync } from 'colorthief';

interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
  isDark?: boolean;
}

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<ColorInfo | null>(null);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setDominantColor(null);
        setPalette([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const extractColors = () => {
    if (imageRef.current && imageRef.current.complete) {
      try {
        const color = getColorSync(imageRef.current);
        if (color) {
          setDominantColor({
            hex: color.hex(),
            rgb: color.array() as [number, number, number],
            isDark: color.isDark,
          });
        }

        const colors = getPaletteSync(imageRef.current, { colorCount: 6 });
        if (colors) {
          setPalette(
            colors.map((c) => ({
              hex: c.hex(),
              rgb: c.array() as [number, number, number],
            }))
          );
        }
      } catch (error) {
        console.error('Error extracting colors:', error);
      }
    }
  };

  const defaultBg = '#f3f4f6'; // Tailwind gray-100
  const bgStyle = dominantColor
    ? { backgroundColor: dominantColor.hex, transition: 'background-color 0.5s ease' }
    : { backgroundColor: defaultBg, transition: 'background-color 0.5s ease' };

  return (
    <div className="min-h-screen transition-colors duration-500" style={bgStyle}>
      <div className="min-h-screen bg-black/5 backdrop-blur-3xl p-4 sm:p-10 lg:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col items-center">
        <main className="flex flex-col gap-6 sm:gap-8 items-center max-w-5xl w-full flex-grow bg-white/80 p-6 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-md border border-white/40">
          <div className="text-center space-y-2 mb-2 sm:mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">Color Extractor</h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium px-4">Upload an image to extract its dominant color and palette instantly.</p>
          </div>

          <div className="w-full max-w-xl">
            <label
              htmlFor="image-upload"
              className={`group flex flex-col items-center justify-center w-full h-40 sm:h-56 border-3 border-dashed rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md ${isDragging ? 'bg-blue-50 border-blue-500' : 'bg-white/50 hover:bg-white/80 border-gray-300 hover:border-blue-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-3 sm:p-4 bg-blue-50 text-blue-500 rounded-full mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="mb-1 sm:mb-2 text-sm sm:text-base text-gray-700 text-center"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                <p className="text-xs sm:text-sm text-gray-500">Supports PNG, JPG, JPEG, WEBP</p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {imageSrc && (
            <div className="flex flex-col lg:flex-row gap-10 w-full mt-8 items-stretch justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col items-center gap-4 w-full lg:w-1/2">
                <div className="relative w-full aspect-square sm:aspect-video lg:aspect-square bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-200/50 shadow-inner p-2">
                  <div className="w-full h-full rounded-xl overflow-hidden relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Uploaded image"
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      onLoad={extractColors}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2 flex flex-col gap-8 justify-center">
                {dominantColor && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-6 rounded-full bg-blue-500"></span>
                      Dominant Color
                    </h2>
                    <div className="flex items-center gap-6 p-5 rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow">
                      <div
                        className="w-20 h-20 rounded-full shadow-inner border-4 border-white ring-1 ring-gray-200"
                        style={{ backgroundColor: dominantColor.hex }}
                      ></div>
                      <div className="flex flex-col">
                        <span className="font-mono text-2xl font-bold text-gray-900">{dominantColor.hex}</span>
                        <span className="text-sm font-medium text-gray-500 mt-1">
                          rgb({dominantColor.rgb[0]}, {dominantColor.rgb[1]}, {dominantColor.rgb[2]})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {palette.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-6 rounded-full bg-purple-500"></span>
                      Color Palette
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-md">
                      {palette.map((color, index) => (
                        <div key={index} className="group flex flex-col items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigator.clipboard.writeText(color.hex)}>
                          <div
                            className="w-full h-20 rounded-xl shadow-inner group-hover:scale-105 group-hover:shadow-md transition-all duration-300"
                            style={{ backgroundColor: color.hex }}
                          ></div>
                          <span className="font-mono text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">{color.hex}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2 italic">Click any color to copy hex</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className={`mt-8 pt-6 w-full max-w-5xl text-center text-sm font-medium flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 transition-colors duration-500 ${dominantColor ? (dominantColor.isDark ? 'text-gray-300' : 'text-gray-600') : 'text-gray-600'}`}>
          <p>
            Powered by <a href="https://github.com/lokesh/color-thief" target="_blank" rel="noopener noreferrer" className={`hover:underline transition-colors font-bold ${dominantColor ? (dominantColor.isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800') : 'text-blue-600 hover:text-blue-800'}`}>Color Thief</a> by <a href="https://lokeshdhakar.com/" target="_blank" rel="noopener noreferrer" className={`hover:underline transition-colors font-semibold ${dominantColor ? (dominantColor.isDark ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-black') : 'text-gray-800 hover:text-black'}`}>Lokesh Dhakar</a>
          </p>
          <span className={`hidden sm:inline ${dominantColor ? (dominantColor.isDark ? 'text-gray-500' : 'text-gray-400') : 'text-gray-400'}`}>•</span>
          <p>
            Built by <a href="https://www.axwaizee.xyz/" target="_blank" rel="noopener noreferrer" className={`hover:underline transition-colors font-bold ${dominantColor ? (dominantColor.isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800') : 'text-purple-600 hover:text-purple-800'}`}>Axwaizee</a> (<a href="https://github.com/Axwaizee" target="_blank" rel="noopener noreferrer" className={`hover:underline transition-colors font-semibold ${dominantColor ? (dominantColor.isDark ? 'text-gray-200 hover:text-white' : 'text-gray-800 hover:text-black') : 'text-gray-800 hover:text-black'}`}>GitHub</a>)
          </p>
        </footer>
      </div>
    </div>
  );
}
