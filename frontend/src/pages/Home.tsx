import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Color } from '../ColorPicker';
import { Pixel } from '../PixelCanvas';

export type Canvas = {
  id: string
  name: string
  width: number
  height: number
  cooldown: number
  pixels?: Pixel[]
  colors?: Color[]
  updated_at: string
  inserted_at: string
}

export default function Home() {
  const token = useSelector((state: RootState) => state.account.token)
  const [canvases, setCanvases] = useState<Canvas[]>([]);

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
        console.log(response.data)
        setCanvases(response.data.canvases)
      } catch(error) {
        console.error(error)
      }
    }

    getCanvases()
  }, [token])

  return (
    <div className={`h-screen w-screen overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-teal-500`}>
      {canvases.map((canvas: Canvas) => {
        return (
          <Link to={`/canvases/${canvas.id}`} key={canvas.id} className="m-3 p-4 bg-white rounded-md shadow-sm">
            <div className="text-sm font-semibold mb-1">{canvas.name}</div>
            <div className='flex flex-row justify-between text-sm'>
              <p className="text-xs text-gray-500 mt-1">
                Size: <span className="font-medium">{canvas.width} × {canvas.height}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Cooldown: <span className="font-medium">{canvas.cooldown}</span>
              </p>
            </div>
            <div className="mt-3 aspect-square bg-gray-100 rounded" /> {/* Potential preview here */}
            <div className="flex flex-wrap gap-2 pt-3">
              {canvas.colors?.map((color: Color) => (
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