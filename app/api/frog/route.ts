import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

let metadata: any[] | null = null

async function fetchMetadata() {
  if (metadata === null) {
    const filePath = path.resolve(process.cwd(), "public", "bitcoin-frogs-metadata.json")
    console.log("Attempting to read metadata from:", filePath)
    try {
      const fileContents = await fs.readFile(filePath, "utf8")
      metadata = JSON.parse(fileContents)
      console.log("Metadata loaded successfully. Total items:", metadata.length)
      console.log("Sample item:", JSON.stringify(metadata[0], null, 2))
    } catch (error) {
      console.error("Error reading or parsing metadata file:", error)
      throw error
    }
  }
  return metadata
}

export async function GET(request: Request) {
  console.log("API route called")
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  console.log("Requested ID:", id)

  if (!id || isNaN(Number(id))) {
    console.log("Invalid ID provided")
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  const ordinalId = Number(id)

  try {
    const allMetadata = await fetchMetadata()
    if (!allMetadata) {
      console.log("Metadata not available")
      return NextResponse.json({ error: "Metadata not available" }, { status: 500 })
    }

    console.log("Searching for frog with ID:", ordinalId)
    // Find the frog by matching the number in the name
    const frogData = allMetadata.find((item: any) => {
      if (!item.meta || !item.meta.name) return false
      const match = item.meta.name.match(/Bitcoin Frog #(\d+)/)
      return match && Number(match[1]) === ordinalId
    })

    if (!frogData) {
      console.log("No frog found with ID:", ordinalId)
      return NextResponse.json({ error: "Frog not found" }, { status: 404 })
    }

    console.log("Found frog data:", JSON.stringify(frogData, null, 2))

    // Map the metadata to our expected format with proper encoding
    const traits = frogData.meta.attributes.reduce((acc: any, attr: any) => {
      // Convert to lowercase, replace spaces with hyphens, and encode any remaining special characters
      const value = attr.value
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/\//g, "-")
        .replace(/[^a-z0-9-]/g, "")

      acc[attr.trait_type.toLowerCase()] = value
      return acc
    }, {})

    const response = {
      id: ordinalId,
      background: traits.background || "none",
      body: traits.body || "none",
      // Now we're using the same body trait for both, but they'll be separate PNGs
      head: traits.body || "none", // This will look for a separate head PNG with the same name
      eyes: traits.eyes || "none",
      mouth: traits.mouth || "none",
      clothing: traits.clothing || "none",
    }

    console.log("Sending response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching frog data:", error)
    return NextResponse.json({ error: "Failed to fetch frog data" }, { status: 500 })
  }
}

