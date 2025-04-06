import { useState, useCallback, useEffect } from 'react';
import PixelCanvas, { Pixel } from '../PixelCanvas';
import ColorPicker, { Color } from '../ColorPicker';
import { useParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { Canvas as CanvasType } from './home';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default function Canvas() {
    const token = useSelector((state: RootState) => state.account.token)
    const [pixels, setPixels] = useState<Pixel[]>([]);
    const [colors, setColors] = useState<Color[]>([])
    const [canvas, setCanvas] = useState<CanvasType | null>(null)

    const { canvas_id } = useParams()

    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
  
    const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  
    const handlePixelClick = useCallback((x: number, y: number) => {
      setSelectedPixel({ x, y });
    }, []);
  
    const handleApplyColor = async () => {
      if (!selectedPixel) return;
      if (!selectedColor) return;
      if(!canvas) return;
  
      try {
        const response: AxiosResponse = await axios.patch(`http://localhost:4000/api/canvases/${canvas.id}/pixels/${selectedPixel.x}/${selectedPixel.y}`, {
          color_id: selectedColor.id
        }, {
          headers: {
            authorization: `Bearer ${token}`
          }
        });
        console.log(response.data)
      } catch(error) {
        console.error(error)
      }

      setPixels(prev => {
        const filtered = prev.filter(
          p => !(p.x === selectedPixel.x && p.y === selectedPixel.y)
        );
        return [...filtered, { ...selectedPixel, color: selectedColor }];
      });
    };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPixel) return;
      if(!canvas) return;
      let { x, y } = selectedPixel;
  
      switch (e.key) {
        case 'ArrowUp':
          y = Math.max(0, y - 1);
          break;
        case 'ArrowDown':
          y = Math.min(canvas.height! - 1, y + 1);
          break;
        case 'ArrowLeft':
          x = Math.max(0, x - 1);
          break;
        case 'ArrowRight':
          x = Math.min(canvas.width! - 1, x + 1);
          break;
        default:
          return;
      }
  
      setSelectedPixel({ x, y });
      e.preventDefault();
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPixel, canvas]);

    useEffect(() => {
      const getCanvas = async (canvas_id: string) => {
        try {
          const response = await axios.get(`http://localhost:4000/api/canvases/${canvas_id}`, 
            {
              headers: {
                authorization: `Bearer ${token}`
              }
            }
          )

          setCanvas(response.data.canvas)
          setPixels(response.data.canvas.pixels)
          setColors(response.data.canvas.colors)

          if (response.data.canvas.colors.length > 0) {
            setSelectedColor(response.data.canvas.colors[0])
          }
        } catch(error) {
          console.error(error)
        }
      }

      if(canvas_id) {
        getCanvas(canvas_id)
      }
    }, [token, canvas_id])

    return (
        <div className="w-screen h-screen flex flex-col">
          <div className="absolute bottom-0 left-1/2 w-3/4 -translate-x-1/2 h-[12vh] rounded-md">
              <ColorPicker
                colors={colors}
                selectedColor={selectedColor}
                onColorClick={setSelectedColor}
                onSubmit={handleApplyColor}
                selectedPixel={selectedPixel}
              />
          </div>
          <div className="flex-1">
              <PixelCanvas
                pixels={pixels}
                gridWidth={canvas?.width || 0}
                gridHeight={canvas?.height || 0}
                zoom={zoom}
                offset={offset}
                onZoomChange={setZoom}
                onOffsetChange={setOffset}
                onPixelClick={handlePixelClick}
                selectedPixel={selectedPixel}
              />
          </div>
        </div>
    )
}