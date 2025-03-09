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

    // Create a new GIF
    const gif = new window.GIF({
      workers: 4,
      quality: 10,
      width: options.width,
      height: options.height,
      workerScript: window.GIF_WORKER_URL,
      transparent: null,
      background: "#FFFFFF",
      repeat: 0,
    })

    // Load all images first
    const loadedImages = await Promise.all(
      options.traits.map(async (trait) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = trait.path
        })
        return { img, type: trait.type }
      }),
    )

    // Create frames
    const totalFrames = 15
    const frameDelay = 100

    for (let i = 0; i < totalFrames; i++) {
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = options.width
      tempCanvas.height = options.height
      const ctx = tempCanvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      // Fill background
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, options.width, options.height)

      // Draw each trait
      loadedImages.forEach(({ img, type }) => {
        const offset = type === "body" || type === "clothing" ? Math.sin((i / totalFrames) * Math.PI * 2) * 3 : 0
        ctx.drawImage(img, 0, offset, options.width, options.height)
      })

      // Add frame to GIF
      gif.addFrame(ctx, { delay: frameDelay, copy: true })
    }

    // Generate and return blob
    return new Promise((resolve, reject) => {
      gif.on("finished", resolve)
      gif.on("error", reject)
      gif.render()
    })
  } catch (error) {
    console.error("Error in createGif:", error)
    throw error
  }
}

export async function downloadGif(blob: Blob, filename = "bitcoin-frog.gif") {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

