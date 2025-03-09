declare module 'gif.js' {
  export default class GIF {
    constructor(options: {
      workers?: number;
      quality?: number;
      width?: number;
      height?: number;
      workerScript?: string;
    });

    addFrame(imageData: ImageData, options?: { delay: number; copy: boolean }): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
  }
}