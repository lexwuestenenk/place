import React from 'react';

export type Color = {
  hex: string;
  index: number;
};

type Props = {
    colors: Color[];
    onColorClick: (color: string) => void;
    onSubmit: () => void;
    selectedPixel: { x: number; y: number } | null;
};

const ColorPicker: React.FC<Props> = ({ colors, onColorClick, onSubmit, selectedPixel }) => {
  return (
    <div className="flex items-center justify-between h-full px-6 bg-white shadow-inner">
      {/* Color Swatches */}
      <div className="flex gap-2">
        {colors.map((color) => (
          <button
            key={color.index}
            className="w-10 h-10 border border-gray-300 rounded"
            style={{ backgroundColor: `#${color.hex}` }}
            onClick={() => onColorClick(`#${color.hex}`)}
          />
        ))}
      </div>

      {/* Apply Button */}
      <button
        onClick={onSubmit}
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded shadow"
      >
        Apply
      </button>
      {selectedPixel && (
        <span>{selectedPixel.x} {selectedPixel.y}</span>
      )}
    </div>
  );
};

export default ColorPicker;
