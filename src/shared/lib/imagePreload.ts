/**
 * Warms the browser cache for the given image URLs. Resolves on error as well:
 * preloading is an optimization and must never block or fail the caller.
 */
export function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

export async function preloadImages(sources: string[]) {
  await Promise.all(sources.map(preloadImage));
}
