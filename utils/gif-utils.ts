export const waitForGif = () => {
  return new Promise<void>((resolve) => {
    if (
      typeof window !== "undefined" &&
      typeof window.GIF !== "undefined" &&
      typeof window.GIF_WORKER_URL !== "undefined"
    ) {
      resolve()
    } else {
      const checkInterval = setInterval(() => {
        if (
          typeof window !== "undefined" &&
          typeof window.GIF !== "undefined" &&
          typeof window.GIF_WORKER_URL !== "undefined"
        ) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 50)
    }
  })
}

