"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import "./styles.css"
import dynamic from "next/dynamic"
import { GifScriptLoader } from "./components/gif-script-loader"

const GIF = dynamic(
  () =>
    import("gif.js").then((mod) => {
      // Ensure we're getting a constructor function
      return typeof mod.default === "function" ? mod.GIF : mod.GIF
    }),
  { ssr: false },
)

// Update the Image props type at the top of the file
type ImageProps = React.ComponentProps<typeof Image>

interface FrogData {
  id: number
  background: string
  body: string
  head: string
  eyes: string
  mouth: string
  clothing: string
}

// Define the animated traits with their frame counts and delays
const tenFrameTraits = [
  "3d-glasses",
  "dank-shades",
  "golden-sunglasses",
  "happy",
  "monocle",
  "nakamoto-glasses",
  "visor",
  "big-moustache",
  "bitcoin-pizza",
  "bubblegum",
  "magicians-moustache",
  "tongue-out",
]

const fifteenFrameTraits = ["powerful", "purple-cosmic-eyes", "bitcoin-pizza-steam", "pipe-smoke", "cigar-smoke"]

const calculateAspectRatio = (originalWidth: number, originalHeight: number, newWidth?: number, newHeight?: number) => {
  if (newWidth) {
    return {
      width: newWidth,
      height: Math.round((newWidth / originalWidth) * originalHeight),
    }
  }
  if (newHeight) {
    return {
      width: Math.round((newHeight / originalHeight) * originalWidth),
      height: newHeight,
    }
  }
  return { width: originalWidth, height: originalHeight }
}

// Create a new AnimatedImage component to handle frame cycling
const AnimatedImage = ({
  trait,
  type,
  className,
  zIndex,
}: {
  trait: string
  type: string
  className?: string
  zIndex: number
}) => {
  const [currentFrame, setCurrentFrame] = useState(1)
  const frameCount = tenFrameTraits.includes(trait) ? 10 : fifteenFrameTraits.includes(trait) ? 15 : 1
  const frameDelay = tenFrameTraits.includes(trait) ? 150 : 100
  const isAnimated = frameCount > 1

  // Set up animation cycle
  useEffect(() => {
    if (!isAnimated) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev % frameCount) + 1)
    }, frameDelay)

    return () => clearInterval(interval)
  }, [frameCount, frameDelay, isAnimated])

  const getFramePath = useCallback(() => {
    if (!isAnimated) {
      return `/traits/${type}/${trait}.png`
    }

    const paddedFrame = String(currentFrame).padStart(2, "0")
    return `/traits/${type}/${trait}-${paddedFrame}.png`
  }, [isAnimated, type, trait, currentFrame])

  return (
    <Image
      src={getFramePath() || "/placeholder.svg"}
      alt={`Frog ${type} - ${trait}`}
      fill
      priority
      unoptimized
      sizes="600px"
      className={className}
      style={{ objectFit: "contain", zIndex }}
      onError={(e) => {
        console.error(`Error loading ${type} image: ${getFramePath()}`, e)
      }}
    />
  )
}

const SmokeSteamAnimation = ({ trait }: { trait: string }) => {
  const getSmokeSteamTrait = useCallback((trait: string) => {
    const traitMap: { [key: string]: string } = {
      "bitcoin-pizza": "bitcoin-pizza-steam",
      pipe: "pipe-smoke",
      cigar: "cigar-smoke",
    }
    return traitMap[trait] || null
  }, [])

  const smokeSteamTrait = getSmokeSteamTrait(trait)

  if (!smokeSteamTrait) return null

  return <AnimatedImage trait={smokeSteamTrait} type="mouth" zIndex={10} />
}

// Then update the style prop type in the sortTraitsByLayer function
function sortTraitsByLayer(traits: React.ReactElement[]): React.ReactElement[] {
  // Define the base layer order
  const layerOrder = ["background", "body", "head", "clothing", "eyes", "mouth"]

  const getTraitType = (element: React.ReactElement) => {
    const className = element.props.className || ""
    if (className.includes("background")) return "background"
    if (className.includes("body")) return "body"
    if (className.includes("head")) return "head"
    if (className.includes("eyes")) return "eyes"
    if (className.includes("mouth")) return "mouth"
    return "clothing"
  }

  return [...traits].sort((a, b) => {
    const aType = getTraitType(a)
    const bType = getTraitType(b)

    // Special case: if one of the items is fur-coat, handle it specially
    const aIsFurCoat = a.props.src?.includes("fur-coat") || false
    const bIsFurCoat = b.props.src?.includes("fur-coat") || false

    if (aIsFurCoat && !bIsFurCoat) {
      // If a is fur-coat and b is head, fur-coat goes after
      if (bType === "head") return 1
      // If a is fur-coat and b is anything after head, fur-coat goes before
      if (layerOrder.indexOf(bType) > layerOrder.indexOf("head")) return -1
      // Otherwise use normal ordering
      return layerOrder.indexOf(aType) - layerOrder.indexOf(bType)
    }

    if (!aIsFurCoat && bIsFurCoat) {
      // If b is fur-coat and a is head, fur-coat goes after
      if (aType === "head") return -1
      // If b is fur-coat and a is anything after head, fur-coat goes before
      if (layerOrder.indexOf(aType) > layerOrder.indexOf("head")) return 1
      // Otherwise use normal ordering
      return layerOrder.indexOf(aType) - layerOrder.indexOf(bType)
    }

    // Normal ordering for non-fur-coat items
    return layerOrder.indexOf(aType) - layerOrder.indexOf(bType)
  })
}

// Now update the getTraitPath function to handle animated traits
export default function Home() {
  console.log("==========================================")
  console.log("Component mounted. Checking environment variables:")
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL)
  console.log("==========================================")
  const [ordinalId, setOrdinalId] = useState("")
  const [frogData, setFrogData] = useState<FrogData | null>(null)
  const [isRibbiting, setIsRibbiting] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Add these console logs at the top of your component
  useEffect(() => {
    console.log("==========================================")
    console.log("useEffect triggered. Environment Variables:")
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL)
    console.log("==========================================")
  }, [])

  const handleAnimate = useCallback(async (id: string) => {
    console.log("==========================================")
    console.log(`Animating frog with ordinal #${id}`)
    console.log("Using API URL:", process.env.NEXT_PUBLIC_API_URL)
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/frog?id=${id}`
      console.log(`Fetching from: ${apiUrl}`)
      const response = await fetch(apiUrl)
      console.log("Response status:", response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Failed to fetch frog data: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      console.log("Fetched frog data:", data)
      setFrogData(data)
      setResetKey((prevKey) => prevKey + 1) // Reset animations
    } catch (error) {
      console.error("Error fetching frog data:", error)
    }
    console.log("==========================================")
  }, [])

  const getRandomFrogId = useCallback(() => {
    return Math.floor(Math.random() * 10000) + 1
  }, [])

  const handleRibbit = useCallback(async () => {
    console.log("RIBBIT clicked!")
    setIsRibbiting(true)
    const randomFrogId = getRandomFrogId()
    setOrdinalId(randomFrogId.toString())

    // Wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000))

    await handleAnimate(randomFrogId.toString())
    setIsRibbiting(false)
  }, [getRandomFrogId, handleAnimate])

  // Load a random frog on initial render
  useEffect(() => {
    const randomFrogId = getRandomFrogId()
    setOrdinalId(randomFrogId.toString())
    handleAnimate(randomFrogId.toString())
  }, [handleAnimate, getRandomFrogId])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAnimate(ordinalId)
    }
  }

  const buttonStyle = {
    transition: "all 0.1s ease",
    cursor: "pointer",
  }

  const getAnimationClass = useCallback((type: string, trait: string) => {
    const baseClass = "frog-trait " // Add a base class for all traits
    const randomDelay = Math.random() * 0.5 // Random delay between 0 and 0.5 seconds
    if (type === "body" || type === "clothing") {
      return `${baseClass}float-animation-1 animate-delay-${randomDelay.toFixed(2)}`
    } else if (
      type === "head" ||
      type === "mouth" ||
      (type === "eyes" && ["none", "purple-cosmic-eyes", "powerful", "angry", "frown", "happy"].includes(trait))
    ) {
      return `${baseClass}float-animation-2 animate-delay-${randomDelay.toFixed(2)}`
    } else if (type === "eyes") {
      return `${baseClass}float-animation-3 animate-delay-${randomDelay.toFixed(2)}`
    }
    return baseClass
  }, [])

  // Helper function to determine if we need to load the "none" eyes
  const shouldLoadNoneEyes = useCallback((eyeTrait: string) => {
    const excludedTraits = ["angry", "frown", "happy", "none"]
    return !excludedTraits.includes(eyeTrait.toLowerCase())
  }, [])

  // Helper function to check if a trait is animated
  const isAnimatedTrait = useCallback((trait: string) => {
    return tenFrameTraits.includes(trait) || fifteenFrameTraits.includes(trait)
  }, [])

  const handleDownload = useCallback(async () => {
    if (!frogData) return

    try {
      console.log("Starting GIF generation process...")
      setIsDownloading(true)

      const { createGif } = await import("../utils/gif-generator")
      console.log("createGif function imported:", typeof createGif)

      // Prepare traits
      const traits = [
        { type: "background", path: `/traits/background/${frogData.background}.png` },
        { type: "body", path: `/traits/body/${frogData.body}.png` },
        { type: "head", path: `/traits/head/${frogData.head}.png` },
        { type: "clothing", path: `/traits/clothing/${frogData.clothing}.png` },
        { type: "eyes", path: `/traits/eyes/${frogData.eyes}.png` },
        { type: "mouth", path: `/traits/mouth/${frogData.mouth}.png` },
      ].filter((trait) => {
        const traitKey = trait.type as keyof typeof frogData
        // Special case: keep "none" for eyes trait
        if (trait.type === "eyes" && frogData[traitKey] === "none") {
          return true
        }
        return frogData[traitKey] !== "none"
      })

      console.log("Processing traits:", traits)

      // Create and download GIF
      const blob = await createGif({
        width: 1024, // Updated to 1024
        height: 1024, // Updated to 1024
        traits,
      })

      console.log("GIF blob created, initiating download...")

      // Create and trigger download
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `frog-${frogData.id}.gif`
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error("Error in handleDownload:", error)
      alert("Failed to generate GIF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }, [frogData])

  return (
    <main style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <GifScriptLoader />
      {/* Background */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <Image
          src="/images/pond.gif"
          alt="Pond Background"
          fill
          priority
          unoptimized
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 10,
        }}
      >
        {/* Top right icons */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <a
            href="https://x.com/BitcoinFrogs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ position: "relative", display: "block" }}
          >
            <Image
              src="/images/x-logo.png"
              alt="X Logo"
              width={70} // Updated width
              height={59} // Updated height
              priority
              style={{
                borderRadius: "8px",
              }}
            />
          </a>
          <a
            href="https://magiceden.io/ordinals/marketplace/bitcoin-frogs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ position: "relative", display: "block" }}
          >
            <Image
              src="/images/magic-eden-logo.png"
              alt="Magic Eden"
              width={96}
              height={64}
              priority
              style={{
                borderRadius: "8px",
                width: "auto",
                height: "auto",
              }}
            />
          </a>
          <a
            href="https://discord.com/invite/PfGq3z2Xtn"
            target="_blank"
            rel="noopener noreferrer"
            style={{ position: "relative", display: "block" }}
          >
            <Image
              src="/images/discord-logo.png"
              alt="Discord Logo"
              width={95} // Updated width
              height={85} // Updated height
              priority
              style={{
                borderRadius: "8px",
              }}
            />
          </a>
        </div>

        {/* RIBBIT button */}
        <button
          onClick={handleRibbit}
          className="animated-button"
          style={{
            ...buttonStyle,
            position: "absolute",
            top: "1rem",
            left: "1rem",
            padding: "0.5rem 1rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#fbeb97",
            backgroundColor: "#22c55e",
            border: "none",
            borderRadius: "9999px",
          }}
        >
          RIBBIT
        </button>

        {isRibbiting ? (
          <div className="pulse-animation" style={{ width: "572px", height: "572px", position: "relative" }}>
            <Image src="/images/loading.gif" alt="Loading" fill style={{ objectFit: "contain" }} />
          </div>
        ) : (
          <>
            <h1
              style={{
                fontSize: "96px",
                fontWeight: "bold",
                color: "#fbeb97",
                marginBottom: "2rem",
                textShadow:
                  "0 0 5px rgba(247, 147, 26, 0.5), 0 0 10px rgba(247, 147, 26, 0.3), 0 0 15px rgba(247, 147, 26, 0.2)",
              }}
            >
              Bitcoin Frogs
            </h1>

            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem" }}>
              <input
                type="number"
                id="ordinalId"
                name="ordinalId"
                placeholder="Ordinal #"
                min="1"
                max="10000"
                value={ordinalId}
                onChange={(e) => setOrdinalId(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  padding: "0.625rem",
                  width: "96px",
                  textAlign: "center",
                  backgroundColor: "white",
                  color: "black",
                  borderRadius: "4px",
                  border: "none",
                }}
              />
              <button
                onClick={() => {
                  console.log("Animate button clicked")
                  handleAnimate(ordinalId)
                }}
                className="animated-button"
                style={{
                  ...buttonStyle,
                  padding: "0.625rem 1.25rem",
                  backgroundColor: "#f7931a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Animate
              </button>
              <button
                onClick={handleDownload}
                disabled={!frogData || isDownloading}
                className="animated-button"
                style={{
                  ...buttonStyle,
                  padding: "0.625rem 1.25rem",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                {isDownloading ? "Generating..." : "Download GIF"}
              </button>
            </div>

            {/* Frog display container */}
            <div
              key={resetKey}
              style={{
                width: "429px", // 1.5 times the original 286px
                height: "429px", // 1.5 times the original 286px
                backgroundColor: "white",
                border: "4px solid #609c13",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {frogData ? (
                <>
                  {sortTraitsByLayer(
                    [
                      frogData.background !== "none" && (
                        <Image
                          src={`/traits/background/${frogData.background}.png`}
                          alt="Frog Background"
                          fill
                          sizes="600px"
                          priority
                          unoptimized
                          style={{ objectFit: "cover", zIndex: 1 }}
                          onError={(e) => {
                            console.error(
                              `Error loading background image: /traits/background/${frogData.background}.png`,
                              e,
                            )
                          }}
                          key="background"
                        />
                      ),
                      <Image
                        src={`/traits/body/${frogData.body}.png`}
                        alt="Frog Body"
                        fill
                        sizes="600px"
                        unoptimized
                        className={getAnimationClass("body", frogData.body)}
                        style={{ objectFit: "contain", zIndex: 2 }}
                        onError={(e) => {
                          console.log(`Error loading body image: /traits/body/${frogData.body}.png`)
                        }}
                        key="body"
                      />,
                      frogData.clothing !== "none" && (
                        <Image
                          src={`/traits/clothing/${frogData.clothing}.png`}
                          alt="Frog Clothing"
                          fill
                          sizes="600px"
                          unoptimized
                          className={getAnimationClass("clothing", frogData.clothing)}
                          style={{ objectFit: "contain", zIndex: 3 }}
                          onError={(e) => {
                            console.log(`Error loading clothing image: /traits/clothing/${frogData.clothing}.png`)
                          }}
                          key="clothing"
                        />
                      ),
                      <Image
                        src={`/traits/head/${frogData.head}.png`}
                        alt="Frog Head"
                        fill
                        sizes="600px"
                        unoptimized
                        className={getAnimationClass("head", frogData.head)}
                        style={{ objectFit: "contain", zIndex: 4 }}
                        onError={(e) => {
                          console.log(`Error loading head image: /traits/head/${frogData.head}.png`)
                        }}
                        key="head"
                      />,
                      // Render the "none" eyes only if needed
                      shouldLoadNoneEyes(frogData.eyes) && (
                        <Image
                          src={`/traits/eyes/none.png`}
                          alt="Frog Eyes Base"
                          fill
                          priority
                          unoptimized
                          sizes="600px"
                          className={getAnimationClass("eyes", "none")}
                          style={{ objectFit: "contain", zIndex: 5 }}
                          onError={(e) => {
                            console.log(`Error loading base eyes image: /traits/eyes/none.png`)
                          }}
                          key="eyes-base"
                        />
                      ),
                      // For animated eye traits, use the AnimatedImage component
                      isAnimatedTrait(frogData.eyes) ? (
                        <AnimatedImage
                          trait={frogData.eyes}
                          type="eyes"
                          className={getAnimationClass("eyes", frogData.eyes)}
                          zIndex={6}
                          key="eyes"
                        />
                      ) : (
                        // For non-animated eye traits, use regular Image
                        <Image
                          src={`/traits/eyes/${frogData.eyes}.png`}
                          alt="Frog Eyes"
                          fill
                          priority
                          unoptimized
                          sizes="600px"
                          className={getAnimationClass("eyes", frogData.eyes)}
                          style={{ objectFit: "contain", zIndex: 6 }}
                          onError={(e) => {
                            console.log(`Error loading eyes image: /traits/eyes/${frogData.eyes}.png`)
                          }}
                          key="eyes"
                        />
                      ),
                      // For animated mouth traits, use the AnimatedImage component
                      isAnimatedTrait(frogData.mouth) ? (
                        <AnimatedImage
                          trait={frogData.mouth}
                          type="mouth"
                          className={getAnimationClass("mouth", frogData.mouth)}
                          zIndex={7}
                          key="mouth"
                        />
                      ) : (
                        // For non-animated mouth traits, use regular Image
                        <Image
                          src={`/traits/mouth/${frogData.mouth}.png`}
                          alt="Frog Mouth"
                          fill
                          priority
                          unoptimized
                          sizes="600px"
                          className={getAnimationClass("mouth", frogData.mouth)}
                          style={{ objectFit: "contain", zIndex: 7 }}
                          onError={(e) => {
                            console.log(`Error loading mouth image: /traits/mouth/${frogData.mouth}.png`)
                          }}
                          key="mouth"
                        />
                      ),
                      <SmokeSteamAnimation trait={frogData.mouth} key="smoke" />,
                    ].filter(Boolean),
                  )}
                </>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
            fontSize: "1.125rem",
            fontWeight: "bold",
            color: "#fbeb97",
          }}
        >
          <a
            href="https://x.com/shanghai_btc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "#fbeb97" }}
          >
            by @shanghai_btc
          </a>
        </div>
      </div>
      {/* Add this hidden canvas element */}
      <canvas ref={canvasRef} width="429" height="429" style={{ display: "none" }} />
    </main>
  )
}

