"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface AnimatedTraitProps {
  type: string
  trait: string
  getTraitPath: (type: string, trait: string, frameIndex?: number) => string
  frameCount: number
  frameDuration: number
  className?: string
  zIndex: number
}

export function AnimatedTrait({
  type,
  trait,
  getTraitPath,
  frameCount,
  frameDuration,
  className = "",
  zIndex,
}: AnimatedTraitProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Reset animation when trait changes
    setCurrentFrame(0)

    // Set up the animation interval
    const intervalId = setInterval(() => {
      setCurrentFrame((prevFrame) => (prevFrame + 1) % frameCount)
    }, frameDuration)

    // Cleanup function
    return () => clearInterval(intervalId)
  }, [trait, frameCount, frameDuration])

  // Get the path for the current frame
  const imagePath = getTraitPath(type, trait, currentFrame)

  return (
    <Image
      src={imagePath || "/placeholder.svg"}
      alt={`${type} ${trait}`}
      fill
      priority
      unoptimized
      sizes="600px"
      className={className}
      style={{ objectFit: "contain", zIndex }}
    />
  )
}

