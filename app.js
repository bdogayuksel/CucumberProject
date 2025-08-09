import { generateICLightViaServer } from "./lib/fal.js";

const fileInput = document.getElementById("file-input");
const chooseFileButton = document.getElementById("choose-file");
const dropzone = document.getElementById("dropzone");
const inputPreviewImg = document.getElementById("input-preview");

const promptInput = document.getElementById("prompt-input");
const generateButton = document.getElementById("generate-btn");
const resetButton = document.getElementById("reset-btn");

const resultImg = document.getElementById("result-img");
const downloadLink = document.getElementById("download-link");
const loader = document.getElementById("loader");
const placeholder = document.getElementById("placeholder");

let uploadedImageUrl = null;
let uploadedImageBlob = null;
let serverUsable = false;

async function probeServer() {
  try {
    const base = typeof window !== 'undefined' && window.ICLIGHT_API_BASE ? window.ICLIGHT_API_BASE : '';
    if (!base) return false;
    const r = await fetch(`${base}/health`, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) return false;
    const j = await r.json();
    return Boolean(j && j.ok);
  } catch {
    return false;
  }
}

function updateGenerateEnabled() {
  const hasImage = Boolean(uploadedImageUrl);
  const hasPrompt = promptInput.value.trim().length > 0;
  generateButton.disabled = !(hasImage && hasPrompt);
}

function setResultPlaceholderVisible(isVisible) {
  placeholder.classList.toggle("hidden", !isVisible);
  resultImg.style.display = isVisible ? "none" : "block";
}

function showLoader(isVisible) {
  loader.classList.toggle("hidden", !isVisible);
}

function resetAll() {
  if (uploadedImageUrl) {
    URL.revokeObjectURL(uploadedImageUrl);
  }
  uploadedImageUrl = null;
  uploadedImageBlob = null;
  fileInput.value = "";
  inputPreviewImg.src = "";
  inputPreviewImg.style.display = "none";
  promptInput.value = "";
  setResultPlaceholderVisible(true);
  resultImg.src = "";
  downloadLink.setAttribute("aria-disabled", "true");
  downloadLink.removeAttribute("href");
  updateGenerateEnabled();
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
  uploadedImageBlob = file;
  uploadedImageUrl = URL.createObjectURL(file);
  inputPreviewImg.src = uploadedImageUrl;
  inputPreviewImg.style.display = "block";
  updateGenerateEnabled();
}

chooseFileButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  loadFile(file);
});

;["dragenter", "dragover"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add("dragover");
  });
});
;["dragleave", "drop"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("dragover");
  });
});
dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer?.files?.[0];
  loadFile(file);
});

promptInput.addEventListener("input", updateGenerateEnabled);
resetButton.addEventListener("click", resetAll);

async function simulateResultImage(imageBlob, promptText) {
  const bitmap = await createImageBitmap(imageBlob);
  const maxDim = 1024;
  const scale = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
  const outW = Math.round(bitmap.width * scale);
  const outH = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, outW, outH);
  grad.addColorStop(0, "#1b1f2e");
  grad.addColorStop(1, "#0f1117");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, outW, outH);

  const vignette = ctx.createRadialGradient(outW / 2, outH / 2, Math.min(outW, outH) / 6, outW / 2, outH / 2, Math.max(outW, outH) / 1.1);
  vignette.addColorStop(0, "rgba(255,255,255,0.0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, outW, outH);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = Math.round(Math.min(outW, outH) * 0.04);
  ctx.shadowOffsetY = Math.round(Math.min(outW, outH) * 0.02);
  const pad = Math.round(Math.min(outW, outH) * 0.05);
  const drawW = outW - pad * 2;
  const drawH = Math.round((drawW / bitmap.width) * bitmap.height);
  const dx = pad;
  const dy = Math.round((outH - drawH) / 2);
  ctx.drawImage(bitmap, dx, dy, drawW, drawH);
  ctx.restore();

  const caption = promptText.slice(0, 120);
  ctx.font = `${Math.max(12, Math.round(outW * 0.02))}px ui-sans-serif, system-ui, Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.textAlign = "center";
  ctx.fillText(caption, outW / 2, outH - Math.round(outH * 0.04));

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  return blob;
}

async function onGenerate() {
  if (!uploadedImageBlob) return;
  setResultPlaceholderVisible(false);
  showLoader(true);

  await new Promise((r) => setTimeout(r, 200));

  try {
    if (serverUsable) {
      const { url } = await generateICLightViaServer({ imageFileOrUrl: uploadedImageBlob, prompt: promptInput.value.trim(), imageSize: 'square', outputFormat: 'png' });
      resultImg.src = url;
      resultImg.style.display = "block";
      downloadLink.href = url;
      downloadLink.setAttribute("aria-disabled", "false");
      showLoader(false);
      return;
    }
  } catch (err) {
    console.warn('IC-Light server call failed; falling back to placeholder', err);
  }

  const outBlob = await simulateResultImage(uploadedImageBlob, promptInput.value.trim());
  const outUrl = URL.createObjectURL(outBlob);
  resultImg.src = outUrl;
  resultImg.style.display = "block";
  downloadLink.href = outUrl;
  downloadLink.setAttribute("aria-disabled", "false");

  showLoader(false);
}

generateButton.addEventListener("click", () => {
  onGenerate().catch((err) => {
    console.error(err);
    showLoader(false);
    setResultPlaceholderVisible(true);
    alert("Bir şeyler ters gitti. Lütfen tekrar deneyin.");
  });
});

(async function init() {
  resetAll();
  serverUsable = await probeServer();
})();