import { createCanvas, type Canvas, type SKRSContext2D } from '@napi-rs/canvas';

interface CanvasAndContext {
  canvas: Canvas;
  context: SKRSContext2D;
}

export function validateCanvasDimensions(width: number, height: number): void {
  if (Number.isNaN(width) || width <= 0 || Number.isNaN(height) || height <= 0) {
    throw new Error(`Invalid canvas dimensions: ${width}x${height}`);
  }
}

export class NapiCanvasFactory {
  create(width: number, height: number): CanvasAndContext {
    validateCanvasDimensions(width, height);

    const canvas = createCanvas(Math.ceil(width), Math.ceil(height));

    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  }

  reset(canvasAndContext: CanvasAndContext, width: number, height: number): void {
    validateCanvasDimensions(width, height);

    canvasAndContext.canvas.width = Math.ceil(width);

    canvasAndContext.canvas.height = Math.ceil(height);
  }

  destroy(canvasAndContext: CanvasAndContext): void {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}
