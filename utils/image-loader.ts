// Cache for both successful and failed image loads
const imageCache = new Map<string, Promise<HTMLImageElement | HTMLCanvasElement>>()

export function loadImage(src: string): Promise<HTMLImageElement | HTMLCanvasElement> {
  // Check if we already have a loading promise for this image
  if (imageCache.has(src)) {
    return imageCache.get(src)!
  }

  // Create and cache the loading promise
  const loadingPromise = new Promise<HTMLImageElement | HTMLCanvasElement>((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log(`Successfully loaded image: ${src}`)
      resolve(img)
    }

    img.onerror = () => {
      console.log(`Failed to load image: ${src}, using fallback canvas`)
      const canvas = createFallbackCanvas()
      resolve(canvas)
    }

    img.src = src
  })

  // Store the promise in the cache
  imageCache.set(src, loadingPromise)

  return loadingPromise
}

function createFallbackCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = 400
  canvas.height = 400
  return canvas
}

