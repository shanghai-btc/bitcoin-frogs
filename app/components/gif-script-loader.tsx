"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    GIF: any
    GIF_WORKER_URL?: string
  }
}

export const GifScriptLoader = () => {
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Remove any existing scripts first
        document.querySelectorAll('script[src*="gif.js"]').forEach((script) => script.remove())

        // Load main GIF.js script
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js"
          script.async = true
          script.onload = () => resolve()
          script.onerror = reject
          document.body.appendChild(script)
        })

        console.log("GIF.js main script loaded")

        // Create and inject the worker blob
        const workerBlob = new Blob(
          [
            `
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js');
            
            // Add custom error handling
            self.onerror = function(error) {
              self.postMessage({ type: 'error', error: error.toString() });
            };

            // Add custom completion handling
            const originalPostMessage = self.postMessage;
            self.postMessage = function(message) {
              if (message.type === 'finished') {
                console.log('Worker: Finished processing');
              }
              originalPostMessage.apply(self, arguments);
            };
          `,
          ],
          { type: "application/javascript" },
        )

        // Create object URL for the worker
        const workerUrl = URL.createObjectURL(workerBlob)

        // Store the worker URL globally so gif.js can find it
        window.GIF_WORKER_URL = workerUrl

        console.log("GIF.js worker script prepared")
      } catch (error) {
        console.error("Error loading GIF.js scripts:", error)
      }
    }

    loadScripts()

    return () => {
      // Cleanup
      if (window.GIF_WORKER_URL) {
        URL.revokeObjectURL(window.GIF_WORKER_URL)
        delete window.GIF_WORKER_URL
      }
    }
  }, [])

  return null
}

