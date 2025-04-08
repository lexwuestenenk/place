import React, { useEffect } from 'react';
import { Color } from '../types';
import { CheckIcon } from 'lucide-react';

type Props = {
  cooldown: number;
  colors: Color[];
  onColorClick: (color: Color) => void;
  onSubmit: () => void;
  selectedColor: Color | null
  selectedPixel: { x: number; y: number } | null;
};

const ColorPicker: React.FC<Props> = ({ cooldown, colors, onColorClick, onSubmit, selectedColor, selectedPixel }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSubmit();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return (
    <div className="flex flex-col items-center gap-2 absolute bottom-4 max-w-3/4 left-1/2 -translate-x-1/2">
      {cooldown > 0 ? (
        <button
          className="px-4 py-2 bg-emerald-700 cursor-disabled text-white font-semibold rounded-md shadow transition cursor-not-allowed"
        >
          {cooldown}
        </button>
      ) : (
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md shadow transition"
        >
          <CheckIcon />
        </button>
      )}


      <div className="flex flex-wrap items-center justify-center gap-3 bg-white p-4 rounded-xl shadow-md border border-gray-200 max-h-[13.5vh] overflow-y-auto">
        {colors.map((color) => (
          <button
            key={color.id}
            onClick={() => onColorClick(color)}
            title={`#${color.hex}`}
            className={`w-10 h-10 rounded-md transition-transform transform hover:scale-110 focus:outline-none ${
              selectedColor?.id === color.id
                ? 'ring-4 ring-emerald-400'
                : 'ring-2 ring-transparent'
            }`}
            style={{ backgroundColor: `#${color.hex}` }}
          />
        ))}
      </div>

      {/* Coordinates */}
      {selectedPixel && (
        <span className="text-sm text-gray-600">
          ({selectedPixel.x}, {selectedPixel.y})
        </span>
      )}
    </div>
  );
};

export default ColorPicker;
