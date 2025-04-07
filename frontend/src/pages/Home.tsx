import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import axios, { AxiosResponse } from 'axios';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, Color } from '../types';
import { setCanvases, setCurrentCanvasId } from '../redux/slices/canvasSlice';
import { CanvasData } from '../redux/slices/canvasSlice';


export default function Home() {
  const dispatch = useDispatch()
  const token = useSelector((state: RootState) => state.account.token)
  const canvases = useSelector((state: RootState) => state.canvas.entities)

  useEffect(() => {
    const getCanvases = async () => {
      try {
        const response: AxiosResponse = await axios.get("http://localhost:4000/api/canvases", 
          {
            headers: {
              authorization: `Bearer ${token}`
            }
          }
        )
        const rawCanvases = response.data.canvases
        const formatted: CanvasData[] = rawCanvases.map((canvas: Canvas) => ({
          meta: { ...canvas },
          pixels: undefined,
          colors: canvas.colors || [],
        }));
      
        dispatch(setCanvases(formatted))
      } catch(error) {
        console.error(error)
      }
    }

    getCanvases()
  }, [token, dispatch])

  return (
    <div className={`h-screen w-screen overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-teal-500`}>
      {Object.values(canvases).map((canvas: CanvasData) => {
        return (
          <Link to={`/canvases/${canvas.meta.id}`} key={canvas.meta.id} className="m-3 p-4 bg-white rounded-md shadow-sm" onClick={() => dispatch(setCurrentCanvasId(canvas.meta.id))}>
            <div className="text-sm font-semibold mb-1">{canvas.meta.name}</div>
            <div className='flex flex-row justify-between text-sm'>
              <p className="text-xs text-gray-500 mt-1">
                Size: <span className="font-medium">{canvas.meta.width} × {canvas.meta.height}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Cooldown: <span className="font-medium">{canvas.meta.cooldown}</span>
              </p>
            </div>
            <div className="mt-3 aspect-square bg-gray-100 rounded" /> {/* Potential preview here */}
            <div className="flex flex-wrap gap-2 pt-3">
              {Object.values(canvas.colors).map((color: Color) => (
                <div
                  key={color.id}
                  className="w-6 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: `#${color.hex}` }}
                  title={`#${color.hex}`}
                />
              ))}
            </div>
          </Link>
        )
      })}
    </div>
  )
}