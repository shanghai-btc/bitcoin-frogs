const tenFrameTraits = [
  "visor",
  "happy",
  "3d-glasses",
  "dank-shades",
  "monocle",
  "nakamoto-glasses",
  "golden-sunglasses",
  "big-moustache",
  "bitcoin-pizza",
  "bubblegum",
  "magicians-moustache",
  "tongue-out",
]

const fifteenFrameTraits = ["powerful", "purple-cosmic-eyes", "pipe-smoke", "cigar-smoke", "bitcoin-pizza-steam"]

const eyeTraitsNeedingNoneBase = [
  "visor",
  "3d-glasses",
  "dank-shades",
  "monocle",
  "nakamoto-glasses",
  "golden-sunglasses",
  "powerful",
  "purple-cosmic-eyes",
]

// Add this after the other constants at the top of the file
const eyeTraitsNotNeedingNoneBase = ["angry", "frown", "happy", "none"]

const smokeTraits = {
  pipe: "pipe-smoke",
  cigar: "cigar-smoke",
  "bitcoin-pizza": "bitcoin-pizza-steam",
}

// Add these new types and functions at the top of the file
type RGB = [number, number, number]

class ColorBox {
  constructor(public colors: RGB[]) {}

  get volume(): number {
    const [rMin, rMax] = this.getMinMax(0)
    const [gMin, gMax] = this.getMinMax(1)
    const [bMin, bMax] = this.getMinMax(2)
    return (rMax - rMin) * (gMax - gMin) * (bMax - bMin)
  }

  private getMinMax(index: number): [number, number] {
    let min = 255
    let max = 0
    for (const color of this.colors) {
      if (color[index] < min) min = color[index]
      if (color[index] > max) max = color[index]
    }
    return [min, max]
  }

  split(): [ColorBox, ColorBox] {
    const [rRange, gRange, bRange] = [0, 1, 2].map((i) => {
      const [min, max] = this.getMinMax(i)
      return max - min
    })

    const splitIndex = [rRange, gRange, bRange].indexOf(Math.max(rRange, gRange, bRange))
    this.colors.sort((a, b) => a[splitIndex] - b[splitIndex])

    const mid = Math.floor(this.colors.length / 2)
    return [new ColorBox(this.colors.slice(0, mid)), new ColorBox(this.colors.slice(mid))]
  }

  getAverageColor(): RGB {
    const sum: RGB = [0, 0, 0]
    for (const color of this.colors) {
      sum[0] += color[0]
      sum[1] += color[1]
      sum[2] += color[2]
    }
    return sum.map((v) => Math.round(v / this.colors.length)) as RGB
  }
}

function medianCut(colors: RGB[], colorCount: number): RGB[] {
  const boxes: ColorBox[] = [new ColorBox(colors)]

  while (boxes.length < colorCount) {
    boxes.sort((a, b) => b.volume - a.volume)
    const [box1, box2] = boxes.shift()!.split()
    boxes.push(box1, box2)
  }

  return boxes.map((box) => box.getAverageColor())
}

function nearestColor(color: RGB, palette: RGB[]): RGB {
  return palette.reduce((nearest, current) => {
    const nearestDist = Math.sqrt(
      (nearest[0] - color[0]) ** 2 + (nearest[1] - color[1]) ** 2 + (nearest[2] - color[2]) ** 2,
    )
    const currentDist = Math.sqrt(
      (current[0] - color[0]) ** 2 + (current[1] - color[1]) ** 2 + (current[2] - color[2]) ** 2,
    )
    return currentDist < nearestDist ? current : nearest
  })
}

interface CreateGifOptions {
  width: number
  height: number
  traits: Array<{
    type: string
    path: string
    frameCount: number
    frameDuration: number
  }>
  getTraitPath: (type: string, trait: string, frameIndex?: number) => string
  GIFConstructor: any
}

function extractTraitName(path: string): string {
  const parts = path.split("/")
  const filename = parts[parts.length - 1]
  return filename.replace(/\.png$/, "").toLowerCase()
}

function isAnimatedTrait(traitName: string): { isAnimated: boolean; frameCount: number; delay: number } {
  const normalizedName = traitName.toLowerCase()
  console.log(`Checking if "${normalizedName}" is animated...`)

  if (tenFrameTraits.includes(normalizedName)) {
    console.log(`✓ "${normalizedName}" is a 10-frame animation`)
    return { isAnimated: true, frameCount: 10, delay: 150 }
  }

  if (fifteenFrameTraits.includes(normalizedName)) {
    console.log(`✓ "${normalizedName}" is a 15-frame animation`)
    return { isAnimated: true, frameCount: 15, delay: 100 }
  }

  console.log(`✗ "${normalizedName}" is not animated`)
  return { isAnimated: false, frameCount: 1, delay: 100 }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (e) => {
      console.error(`Failed to load image: ${src}`, e)
      reject(new Error(`Failed to load image: ${src}`))
    }
    img.src = src
  })
}

// Update the createGif function
export async function createGif(options: {
  width: number
  height: number
  traits: Array<{
    type: string
    path: string
  }>
}) {
  try {
    console.log("Starting GIF generation process...")

    const renderWidth = options.width // Now using the passed width
    const renderHeight = options.height // Now using the passed height

    const renderCanvas = document.createElement("canvas")
    renderCanvas.width = renderWidth
    renderCanvas.height = renderHeight
    const renderCtx = renderCanvas.getContext("2d", { willReadFrequently: true })
    if (!renderCtx) throw new Error("Could not get render canvas context")

    renderCtx.imageSmoothingEnabled = false

    console.log("Loading images...")
    const loadedImages = await Promise.all(
      options.traits.map(async (trait) => {
        const traitName = trait.path.split("/").pop()?.split(".")[0] || ""
        let frames: HTMLImageElement[] = []

        if (tenFrameTraits.includes(traitName) || fifteenFrameTraits.includes(traitName)) {
          const frameCount = tenFrameTraits.includes(traitName) ? 10 : 15
          frames = await Promise.all(
            Array.from({ length: frameCount }, (_, i) => i + 1).map(async (frameNum) => {
              const img = new Image()
              img.crossOrigin = "anonymous"
              const framePath = `/traits/${trait.type}/${traitName}-${String(frameNum).padStart(2, "0")}.png`
              console.log(`Loading frame: ${framePath}`)
              await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = (e) => {
                  console.error(`Failed to load frame: ${framePath}`, e)
                  reject(e)
                }
                img.src = framePath
              })
              return img
            }),
          )
        } else {
          const img = new Image()
          img.crossOrigin = "anonymous"
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
            img.src = trait.path
          })
          frames = [img]
        }

        return { frames, type: trait.type, name: traitName }
      }),
    )

    // Load "none" eyes if needed
    const noneEyesImg = new Image()
    noneEyesImg.crossOrigin = "anonymous"
    await new Promise((resolve, reject) => {
      noneEyesImg.onload = resolve
      noneEyesImg.onerror = reject
      noneEyesImg.src = "/traits/eyes/none.png"
    })

    // Check if we need to add the "none" eyes as a base layer
    const eyeTraits = loadedImages.filter((img) => img.type === "eyes")
    const hasNoneEyes = eyeTraits.some((img) => img.name === "none")
    const hasOtherEyes = eyeTraits.some((img) => img.name !== "none")

    // If we already have "none" eyes, don't add it again
    if (!hasNoneEyes) {
      // Check if we need to add "none" eyes as a base for other eye traits
      const needsNoneEyesBase =
        hasOtherEyes && eyeTraits.some((img) => !eyeTraitsNotNeedingNoneBase.includes(img.name.toLowerCase()))

      if (needsNoneEyesBase) {
        // Insert "none" eyes before the other eye traits
        const eyeIndex = loadedImages.findIndex((img) => img.type === "eyes")
        if (eyeIndex >= 0) {
          loadedImages.splice(eyeIndex, 0, { frames: [noneEyesImg], type: "eyes", name: "none" })
        } else {
          loadedImages.push({ frames: [noneEyesImg], type: "eyes", name: "none" })
        }
      }
    }

    // Load smoke/steam traits if needed
    for (const [baseTrait, smokeTrait] of Object.entries(smokeTraits)) {
      if (loadedImages.some((img) => img.name === baseTrait)) {
        const smokeFrames = await Promise.all(
          Array.from({ length: 15 }, (_, i) => i + 1).map(async (frameNum) => {
            const img = new Image()
            img.crossOrigin = "anonymous"
            const framePath = `/traits/mouth/${smokeTrait}-${String(frameNum).padStart(2, "0")}.png`
            console.log(`Loading smoke frame: ${framePath}`)
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = (e) => {
                console.error(`Failed to load smoke frame: ${framePath}`, e)
                reject(e)
              }
              img.src = framePath
            })
            return img
          }),
        )
        loadedImages.push({ frames: smokeFrames, type: "smoke", name: smokeTrait })
      }
    }

    return new Promise((resolve, reject) => {
      if (!window.GIF) {
        reject(new Error("GIF.js not loaded"))
        return
      }

      let isRendering = false
      let gifInstance: any = null

      try {
        gifInstance = new window.GIF({
          workers: 8,
          quality: 1,
          width: renderWidth,
          height: renderHeight,
          workerScript: window.GIF_WORKER_URL,
          debug: true,
          dither: false,
          transparent: null,
          background: "#FFFFFF",
          preserveColors: true,
          colors: 256,
        })

        gifInstance.on("start", () => {
          console.log("GIF encoding started")
          isRendering = true
        })

        gifInstance.on("progress", (p: number) => {
          console.log(`Encoding progress: ${Math.round(p * 100)}%`)
        })

        gifInstance.on("finished", (blob: Blob) => {
          console.log("GIF finished event received!")
          isRendering = false
          resolve(blob)
        })

        gifInstance.on("error", (error: Error) => {
          console.error("GIF encoding error:", error)
          isRendering = false
          reject(error)
        })

        console.log("Generating frames...")
        const totalFrames = 15
        const animationDuration = 1500
        const frameDelay = animationDuration / totalFrames

        const headDelay = -0.1
        const eyesDelay150ms = -0.1
        const eyesDelay210ms = -0.14

        const eyesWith150msDelay = ["none", "purple-cosmic-eyes", "powerful", "angry", "frown", "happy"]

        // Adjust the maximum offset for the new size
        const maxOffset = Math.round((3 / 143) * renderWidth) // 3 pixels in 143px becomes ~21 pixels in 1024px

        for (let i = 0; i < totalFrames; i++) {
          renderCtx.fillStyle = "#ffffff"
          renderCtx.fillRect(0, 0, renderWidth, renderHeight)

          const layerOrder = ["background", "body", "clothing", "head", "eyes", "mouth", "smoke"]

          for (const layer of layerOrder) {
            const traits = loadedImages.filter((img) => img.type === layer)
            for (const { frames, type, name } of traits) {
              // Calculate pixel-perfect offsets with the original range
              let offset
              if (type === "body" || type === "clothing") {
                offset = Math.round((1 - Math.cos((i / totalFrames) * Math.PI * 2)) * maxOffset)
              } else if (type === "head" || type === "mouth") {
                const delayedFrame = (i + Math.floor(totalFrames * headDelay) + totalFrames) % totalFrames
                offset = Math.round((1 - Math.cos((delayedFrame / totalFrames) * Math.PI * 2)) * maxOffset)
              } else if (type === "eyes") {
                const eyeDelay = eyesWith150msDelay.includes(name) ? eyesDelay150ms : eyesDelay210ms
                const delayedFrame = (i + Math.floor(totalFrames * eyeDelay) + totalFrames) % totalFrames
                offset = Math.round((1 - Math.cos((delayedFrame / totalFrames) * Math.PI * 2)) * maxOffset)
              } else {
                offset = 0
              }

              let frameIndex
              if (frames.length === 15) {
                frameIndex = i
              } else if (frames.length === 10) {
                frameIndex = Math.floor((i / 15) * 10)
              } else {
                frameIndex = 0
              }

              // Draw with pixel-perfect scaling
              renderCtx.drawImage(frames[frameIndex], 0, offset, renderWidth, renderHeight)
            }
          }

          gifInstance.addFrame(renderCtx, {
            delay: frameDelay,
            copy: true,
            dispose: 2,
          })
          console.log(`Added frame ${i + 1}/${totalFrames}`)
        }

        console.log("Starting GIF render...")
        setTimeout(() => {
          try {
            gifInstance.render()
          } catch (error) {
            console.error("Error during render:", error)
            reject(error)
          }
        }, 100)

        setTimeout(() => {
          if (isRendering) {
            console.error("GIF encoding timed out")
            if (gifInstance) {
              gifInstance.abort()
            }
            reject(new Error("GIF encoding timed out"))
          }
        }, 30000)
      } catch (error) {
        console.error("Error in GIF initialization:", error)
        reject(error)
      }
    })
  } catch (error) {
    console.error("Error in createGif:", error)
    throw error
  }
}

export async function downloadGif(blob: Blob, filename = "bitcoin-frog.gif") {
  console.log("=== Download GIF Started ===")
  console.log("Blob details:", { size: blob.size, type: blob.type })

  try {
    if (!blob || blob.size === 0) {
      throw new Error("Invalid blob")
    }

    const url = URL.createObjectURL(blob)
    console.log("Created URL:", url)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)

    console.log("Triggering download...")
    a.click()

    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log("=== Download GIF Completed ===")
    }, 100)
  } catch (error) {
    console.error("Download failed:", error)
    throw error
  }
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Add this function at the end of the file
function analyzeColorPalette(ctx: CanvasRenderingContext2D): number {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const data = imageData.data
  const colorSet = new Set()

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    colorSet.add(`${r},${g},${b}`)
  }

  return colorSet.size
}

