import React from 'react';

export type Color = {
  hex: string;
  index: number;
};

type Props = {
    colors: Color[];
    onColorClick: (color: string) => void;
    onSubmit: () => void;
    selectedColor: string;
    selectedPixel: { x: number; y: number } | null;
};

const ColorPicker: React.FC<Props> = ({ colors, onColorClick, onSubmit, selectedColor, selectedPixel }) => {
  return (
    <div className="flex items-center justify-between h-full px-6 bg-slate-200 rounded-t-2">
      <button
        onClick={onSubmit}
        className="ml-4 px-4 py-2 bg-blue-500 text-white invisible"
      >
        Submit
      </button>
      <div className="flex gap-2">
        {colors.map((color) => (
          <button
            key={color.index}
            className={`w-10 h-10 rounded border-4 ${
              `#${color.hex.toUpperCase()}` === selectedColor.toUpperCase()
                ? 'border-red-500'
                : 'border-white'
            }`}
            style={{ backgroundColor: `#${color.hex}` }}
            onClick={() => onColorClick(`#${color.hex}`)}
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
