import { useState, useCallback, useEffect } from 'react';
import PixelCanvas from '../components/PixelCanvas';
import ColorPicker from '../components/ColorPicker';
import axios, { AxiosResponse } from 'axios';
import { Color } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { selectCurrentCanvas, setCanvas } from '../redux/slices/canvasSlice';

export default function Canvas() {
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.account.token)
  const currentCanvasId = useSelector((state: RootState) => state.canvas.currentCanvasId)
  const canvas = useSelector(selectCurrentCanvas)

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

    console.log('selected_pixel', selectedPixel)
    console.log('selected_color', selectedColor)
    console.log('canvas', canvas)

    try {
      const response: AxiosResponse = await axios.patch(`http://localhost:4000/api/canvases/${currentCanvasId}/pixels/${selectedPixel.x}/${selectedPixel.y}`, {
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
  };

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

        dispatch(setCanvas({
          meta: response.data.canvas,
          pixels: response.data.canvas.pixels ?? [],
          colors: response.data.canvas.colors ?? []
        }));

        if (response.data.canvas.colors.length > 0) {
          setSelectedColor(response.data.canvas.colors[0])
        }
      } catch(error) {
        console.error(error)
      }
    }

    if(currentCanvasId) {
      getCanvas(currentCanvasId)
    }
  }, [token, currentCanvasId, dispatch])

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
          y = Math.min(canvas.meta.height! - 1, y + 1);
          break;
        case 'ArrowLeft':
          x = Math.max(0, x - 1);
          break;
        case 'ArrowRight':
          x = Math.min(canvas.meta.width! - 1, x + 1);
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

  if (!canvas) {
    return <div className="text-white text-center mt-10">Loading canvas...</div>;
  }

  return (
      <div className="w-screen h-screen flex flex-col">
        <div className="absolute bottom-0 left-1/2 w-3/4 -translate-x-1/2 h-[12vh] rounded-md">
            <ColorPicker
              colors={Object.values(canvas?.colors ?? {})}
              selectedColor={selectedColor}
              onColorClick={setSelectedColor}
              onSubmit={handleApplyColor}
              selectedPixel={selectedPixel}
            />
        </div>
        <div className="flex-1">
            <PixelCanvas
              pixels={Object.values(canvas?.pixels ?? {})}
              gridWidth={canvas?.meta.width || 0}
              gridHeight={canvas?.meta.height || 0}
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