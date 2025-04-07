import { useState, useCallback, useEffect, useRef, useContext } from 'react';
import PixelCanvas from '../components/PixelCanvas';
import ColorPicker from '../components/ColorPicker';
import axios from 'axios';
import { Color } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { selectCurrentCanvas, setCanvas, setCurrentCanvasId } from '../redux/slices/canvasSlice';
import { PhoenixContext } from '../components/socket-provider';
import { useParams } from 'react-router-dom';
import UserList from '../components/UserList';

export default function Canvas() {
  const dispatch = useDispatch()
  const phoenix = useContext(PhoenixContext);
  const token = useSelector((state: RootState) => state.account.token)
  const user = useSelector((state: RootState) => state.account.user)
  const currentCanvasId = useSelector((state: RootState) => state.canvas.currentCanvasId)
  const canvas = useSelector(selectCurrentCanvas)
  const { canvas_id } = useParams() 

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [selectedPixel, setSelectedPixel] = useState<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);

  const hasCentered = useRef(false);

  const handlePixelClick = useCallback((x: number, y: number) => {
    setSelectedPixel({ x, y });
    phoenix?.sendPresenceUpdate(x, y, selectedColor?.hex || "")
  }, [selectedColor?.hex, phoenix]);

  useEffect(() => {
    if(!canvas_id) return 
    dispatch(setCurrentCanvasId(canvas_id))
  }, [canvas_id, dispatch])

  useEffect(() => {
    if(!selectedColor) return
    if(!selectedPixel) return
    
    phoenix?.sendPresenceUpdate(selectedPixel.x, selectedPixel.y, selectedColor?.hex || "")
  })

  const handleApplyColor = async () => {
    if (!selectedPixel) return;
    if (!selectedColor) return;
    if(!canvas) return;

    try {
      await axios.patch(`http://localhost:4000/api/canvases/${currentCanvasId}/pixels/${selectedPixel.x}/${selectedPixel.y}`, {
        color_id: selectedColor.id
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
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
    if (!canvas || hasCentered.current) return;
  
    const canvasWidth = canvas.meta.width * 10 * zoom;
    const canvasHeight = canvas.meta.height * 10 * zoom;
  
    const x = (window.innerWidth - canvasWidth) / 2;
    const y = (window.innerHeight - canvasHeight) / 2;
  
    setOffset({ x, y });
    hasCentered.current = true;
  }, [canvas]);

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
      phoenix?.sendPresenceUpdate(x, y, selectedColor?.hex || "")
      e.preventDefault();
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPixel, canvas, phoenix, user.username, selectedColor?.hex]);

  if (!canvas) {
    return <div className="text-white text-center mt-10">Loading canvas...</div>;
  }

  return (
      <div className="w-screen h-screen flex flex-col overflow-hidden">
        <ColorPicker
          colors={Object.values(canvas?.colors ?? {})}
          selectedColor={selectedColor}
          onColorClick={setSelectedColor}
          onSubmit={handleApplyColor}
          selectedPixel={selectedPixel}
        />
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
        <UserList />
      </div>
    )
}