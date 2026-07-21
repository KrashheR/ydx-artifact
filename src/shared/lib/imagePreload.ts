/**
 * Warms the browser cache for the given image URLs. Resolves on error as well:
 * preloading is an optimization and must never block or fail the caller.
 */
export type ImagePreloadResult = {
  src: string;
  status: "loaded" | "error";
  durationMs: number;
};

export function preloadImage(src: string) {
  const startedAt = performance.now();
  return new Promise<ImagePreloadResult>((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        src,
        status: "loaded",
        durationMs: Math.round(performance.now() - startedAt),
      });
    image.onerror = () =>
      resolve({
        src,
        status: "error",
        durationMs: Math.round(performance.now() - startedAt),
      });
    image.src = src;
  });
}

export async function preloadImages(sources: string[]) {
  return Promise.all(sources.map(preloadImage));
}
