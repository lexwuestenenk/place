import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentCanvas } from '../redux/slices/canvasSlice';

type Props = {
  zoom: number;
  offset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onOffsetChange: (offset: { x: number; y: number }) => void;
  onPixelClick: (x: number, y: number) => void;
  selectedPixel: { x: number; y: number } | null;
};

const CELL_SIZE = 10;

function PixelCanvas({
  zoom,
  offset,
  onZoomChange,
  onOffsetChange,
  onPixelClick,
  selectedPixel
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduxCanvas = useSelector(selectCurrentCanvas)
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

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
      const canvas = canvasRef.current;
      if (!canvas) return;
    
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
    
      const worldX = (mouseX - offset.x) / zoom;
      const worldY = (mouseY - offset.y) / zoom;
    
      const scaleFactor = 1.1;
      const newZoom = e.deltaY < 0 ? zoom * scaleFactor : zoom / scaleFactor;
      const clampedZoom = Math.max(0.01, Math.min(newZoom, 20));
    
      const newOffsetX = mouseX - worldX * clampedZoom;
      const newOffsetY = mouseY - worldY * clampedZoom;
    
      onZoomChange(clampedZoom);
      onOffsetChange({ x: newOffsetX, y: newOffsetY });
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
        pixelX < (reduxCanvas?.meta.width || 0) &&
        pixelY >= 0 &&
        pixelY < (reduxCanvas?.meta.height || 0)
      ) {
        onPixelClick(pixelX, pixelY);
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [zoom, offset, reduxCanvas?.meta.width, reduxCanvas?.meta.height, onPixelClick]);

  // Render canvas content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match DOM size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill full canvas background (screen space)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zoom & pan transform
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);

    // Draw white grid background (inside zoom space)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, (reduxCanvas?.meta.width || 0) * CELL_SIZE, (reduxCanvas?.meta.height || 0) * CELL_SIZE);

    // Draw all pixels
    for (const pixel of Object.values(reduxCanvas?.pixels || {})) {
      ctx.fillStyle = `#${pixel.color.hex}`;
      ctx.fillRect(
        pixel.x * CELL_SIZE,
        pixel.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }

    // Highlight selected pixel
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
  }, [zoom, offset, selectedPixel, reduxCanvas?.meta.width, reduxCanvas?.meta.height, reduxCanvas?.pixels]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border border-black cursor-grab active:cursor-grabbing shadow-xl"
    />
  );
}

export default PixelCanvas;
