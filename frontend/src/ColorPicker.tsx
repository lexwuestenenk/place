import React, { useEffect } from 'react';

export type Color = {
  id: string;
  hex: string;
  index: number;
};

type Props = {
    colors: Color[];
    onColorClick: (color: Color) => void;
    onSubmit: () => void;
    selectedColor: Color | null
    selectedPixel: { x: number; y: number } | null;
};

const ColorPicker: React.FC<Props> = ({ colors, onColorClick, onSubmit, selectedColor, selectedPixel }) => {
  useEffect(() => {
    console.log(selectedColor)
  }, [selectedColor])

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
    <div className="flex items-center justify-between h-full bg-slate-200 rounded-md">
      <button
        onClick={onSubmit}
        className="ml-4 px-4 py-2 bg-blue-500 text-white invisible"
      >
        Submit
      </button>
      <div className="flex flex-wrap justify-center gap-2 p-4 bg-white shadow-inner rounded-t-lg border-t border-gray-300">
        {colors.map((color) => (
          <button
            key={color.id}
            className={`w-10 h-10 rounded border-4 
              ${selectedColor && color.id === selectedColor.id
                  ? 'border-red-500'
                  : 'border-white'
              }`
            }
            style={{ backgroundColor: `#${color.hex}` }}
            onClick={() => onColorClick(color)}
          />
        ))}
      </div>

      <button
        onClick={onSubmit}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Submit
      </button>
      {selectedPixel && (
        <span className='absolute bottom-2 right-2'>({selectedPixel.x}, {selectedPixel.y})</span>
      )}
    </div>
  );
};

export default ColorPicker;
