import { NextResponse } from "next/server"
import { createCanvas, loadImage } from "canvas"
import GIFEncoder from "gifencoder"

export async function POST(request: Request) {
  try {
    const { traits } = await request.json()

    // Create canvas and context
    const width = 400
    const height = 400
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    // Create GIF encoder
    const encoder = new GIFEncoder(width, height)
    encoder.start()
    encoder.setRepeat(0) // 0 for repeat, -1 for no-repeat
    encoder.setDelay(100) // frame delay in ms
    encoder.setQuality(10) // image quality

    // Load all images first
    console.log("Loading images...")
    const loadedImages = await Promise.all(
      traits.filter((trait: any) => !trait.path.includes("/none")).map((trait: any) => loadImage(trait.path)),
    )

    // Generate frames
    console.log("Generating frames...")
    const totalFrames = 10
    for (let i = 0; i < totalFrames; i++) {
      // Clear canvas
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)

      // Draw each trait
      for (let j = 0; j < loadedImages.length; j++) {
        const img = loadedImages[j]
        const trait = traits[j]

        const offset =
          trait.type === "body" || trait.type === "clothing"
            ? Math.sin((i / totalFrames) * Math.PI * 2) * 5
            : trait.type === "eyes" || trait.type === "mouth"
              ? Math.sin(((i + 2) / totalFrames) * Math.PI * 2) * 3
              : 0

        ctx.drawImage(img, 0, offset, width, height)
      }

      // Add frame
      encoder.addFrame(ctx)
      console.log(`Added frame ${i + 1}/${totalFrames}`)
    }

    // Finish encoding
    encoder.finish()

    // Return the GIF
    return new NextResponse(encoder.out.getData(), {
      headers: {
        "Content-Type": "image/gif",
        "Content-Disposition": `attachment; filename="frog.gif"`,
      },
    })
  } catch (error) {
    console.error("Error generating GIF:", error)
    return NextResponse.json({ error: "Failed to generate GIF" }, { status: 500 })
  }
}

