import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Canvas, Color, Pixel } from '../../types';
import { RootState } from '../store';

type PixelKey = string; // Format: "x_y"

export type CanvasData = {
  meta: Canvas;
  pixels?: Record<PixelKey, Pixel>;
  colors: Record<string, Color>;
};

type CanvasState = {
  currentCanvasId: string | null;
  entities: Record<string, CanvasData>;
};

const initialState: CanvasState = {
  currentCanvasId: null,
  entities: {},
};

// Helper: make pixel key
const pixelKey = (x: number, y: number) => `${x}_${y}`;

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setCurrentCanvasId(state, action: PayloadAction<string>) {
        state.currentCanvasId = action.payload;
    },
    
    setCanvases(
        state,
        action: PayloadAction<CanvasData[]>
      ) {
        for (const { meta, pixels, colors } of action.payload) {
            const pixelMap: Record<string, Pixel> | undefined = pixels
                ? { ...pixels }
                : undefined;
      
            const colorMap: Record<string, Color> = {};
            for (const c of Object.values(colors)) {
              colorMap[c.id] = c;
            }
        
            state.entities[meta.id] = {
                meta,
                pixels: pixelMap,
                colors: colorMap,
            };
        }
      
        if (action.payload.length > 0) {
          state.currentCanvasId = action.payload[0].meta.id;
        }
    },

    setCanvas(state, action: PayloadAction<{ meta: Canvas; pixels?: Pixel[]; colors: Color[] }>) {
      const { meta, pixels, colors } = action.payload;

      const pixelMap = pixels
        ? Object.fromEntries(pixels.map(p => [pixelKey(p.x, p.y), p]))
        : undefined;

      const colorMap: Record<string, Color> = {};
      for (const c of colors) {
        colorMap[c.id] = c;
      }

      state.entities[meta.id] = {
        meta,
        pixels: pixelMap,
        colors: colorMap,
      };
      state.currentCanvasId = meta.id;
    },

    updatePixel(state, action: PayloadAction<{ canvasId: string; pixel: Pixel }>) {
        const { canvasId, pixel } = action.payload;
        const canvas = state.entities[canvasId];
        if (!canvas) return;
      
        const key = pixelKey(pixel.x, pixel.y);
        const newPixels = {
          ...(canvas.pixels || {}),
          [key]: pixel
        };
      
        canvas.pixels = newPixels;
    },

    replacePixels(state, action: PayloadAction<{ canvasId: string; pixels: Pixel[] }>) {
      const { canvasId, pixels } = action.payload;
      const canvas = state.entities[canvasId];
      if (!canvas) return;

      const pixelMap: Record<string, Pixel> = {};
      for (const p of pixels) {
        pixelMap[pixelKey(p.x, p.y)] = p;
      }

      canvas.pixels = pixelMap;
    },
  },
});


export const selectCurrentCanvas = (state: RootState) => {
    const currentId = state.canvas.currentCanvasId;
    if (!currentId) return null;
    return state.canvas.entities[currentId] ?? null;
};

export const { setCanvas, setCanvases, updatePixel, replacePixels, setCurrentCanvasId } = canvasSlice.actions;
export default canvasSlice.reducer;