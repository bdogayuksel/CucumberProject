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

export async function generateICLightViaServer({ imageFileOrUrl, prompt, imageSize = 'square', outputFormat = 'png' }) {
  if (!prompt) throw new Error('prompt is required');
  const base = typeof window !== 'undefined' && window.ICLIGHT_API_BASE ? window.ICLIGHT_API_BASE : '';
  const endpoint = `${base}/api/iclight`;
  const headers = {};
  let body;

  if (typeof imageFileOrUrl === 'string') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ prompt, image_url: imageFileOrUrl, image_size: imageSize, output_format: outputFormat });
    const resp = await fetch(endpoint, { method: 'POST', headers, body });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } else if (imageFileOrUrl instanceof File || imageFileOrUrl instanceof Blob) {
    const form = new FormData();
    form.set('prompt', prompt);
    form.set('image_size', imageSize);
    form.set('output_format', outputFormat);
    form.set('image', imageFileOrUrl, 'upload.png');
    const resp = await fetch(endpoint, { method: 'POST', body: form });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  }

  throw new Error('imageFileOrUrl must be a URL string or File/Blob');
}