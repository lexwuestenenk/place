import { useRef, useEffect } from 'react';

export type Pixel = {
  x: number;
  y: number;
  color: string;
};

type Props = {
  pixels: Pixel[];
  gridSize: number;
  zoom: number;
  offset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onPixelClick: (x: number, y: number) => void;
  selectedPixel: { x: number; y: number } | null;
};

const CELL_SIZE = 10;

function PixelCanvas({
  pixels,
  gridSize,
  zoom,
  offset,
  onZoomChange,
  onOffsetChange,
  onPixelClick,
  selectedPixel
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Drag and zoom handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        dragStartRef.current = {
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      onOffsetChange({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleFactor = 1.1;
      const newZoom = e.deltaY < 0 ? zoom * scaleFactor : zoom / scaleFactor;
      onZoomChange(Math.max(0.1, Math.min(newZoom, 20)));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [offset, zoom, onOffsetChange, onZoomChange]);

  // Pixel click handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / zoom;
      const y = (e.clientY - rect.top - offset.y) / zoom;

      const pixelX = Math.floor(x / CELL_SIZE);
      const pixelY = Math.floor(y / CELL_SIZE);

      if (
        pixelX >= 0 &&
        pixelX < gridSize &&
        pixelY >= 0 &&
        pixelY < gridSize
      ) {
        onPixelClick(pixelX, pixelY);
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [zoom, offset, gridSize, onPixelClick]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    for (const pixel of pixels) {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(
        pixel.x * CELL_SIZE,
        pixel.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }

    if (selectedPixel) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          selectedPixel.x * CELL_SIZE + 1,
          selectedPixel.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        );
    }

    ctx.restore();
  }, [pixels, zoom, offset, selectedPixel]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border border-black cursor-grab active:cursor-grabbing"
    />
  );
}

export default PixelCanvas;
