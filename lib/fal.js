// Placeholder FAL.AI client wrappers. Wire these to @fal-ai/client later.

export function configureFalApi(key) {
  // In the future: store and use key with the FAL SDK
  console.info("FAL API key configured (placeholder)", key ? "[set]" : "[missing]");
}

export async function removeBackground(imageUrlOrBlob) {
  // TODO: implement with fal.subscribe("fal-ai/imageutils/rembg", ...)
  throw new Error("removeBackground not implemented yet");
}

export async function replaceBackground(foregroundUrlOrBlob, promptOrBg) {
  // TODO: implement with fal.subscribe("fal-ai/bria/background/replace", ...)
  throw new Error("replaceBackground not implemented yet");
}