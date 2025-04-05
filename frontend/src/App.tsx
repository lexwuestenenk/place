import { useState, useCallback } from 'react';
import PixelCanvas, { Pixel } from './PixelCanvas';
import ColorPicker, { Color } from './ColorPicker';

const GRID_SIZE = 200;

export default function App() {
  const [pixels, setPixels] = useState<Pixel[]>(Array.from({ length: GRID_SIZE }, (_, i) => ({
    x: i,
    y: i,
    color: i % 2 === 0 ? '#00f' : '#0f0',
  })));
  const colors: Color[] = [
    { hex: 'FF0000', index: 1 },
    { hex: '0000FF', index: 2 },
    { hex: '00FF00', index: 3 },
    { hex: 'FFFF00', index: 4 },
    { hex: 'FFA500', index: 5 },
    { hex: 'FFFFFF', index: 6 },
  ];

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#ff0000');

  const handlePixelClick = useCallback((x: number, y: number) => {
    setSelectedPixel({ x, y });
  }, []);

  const handleApplyColor = () => {
    if (!selectedPixel) return;

    setPixels(prev => {
      const filtered = prev.filter(
        p => !(p.x === selectedPixel.x && p.y === selectedPixel.y)
      );
      return [...filtered, { ...selectedPixel, color: selectedColor }];
    });

    setSelectedPixel(null);
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className='absolute bottom-0 left-0 w-full h-[10vh]'>
        <ColorPicker 
          colors={colors}
          onColorClick={setSelectedColor}
          onSubmit={handleApplyColor}
          selectedPixel={selectedPixel}
        />
      </div>

      <div className="flex-1">
        <PixelCanvas
          pixels={pixels}
          gridSize={GRID_SIZE}
          zoom={zoom}
          offset={offset}
          onZoomChange={setZoom}
          onOffsetChange={setOffset}
          onPixelClick={handlePixelClick}
          selectedPixel={selectedPixel}
        />
      </div>
    </div>
  );
}
