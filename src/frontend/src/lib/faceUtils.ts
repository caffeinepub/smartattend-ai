const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const fa = (window as any).faceapi;
    if (!fa) throw new Error("face-api.js not loaded from CDN");
    await Promise.all([
      fa.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

export async function extractFaceDescriptor(
  canvas: HTMLCanvasElement,
): Promise<Array<number> | null> {
  const fa = (window as any).faceapi;
  if (!fa) throw new Error("face-api.js not loaded");

  try {
    const result = await fa
      .detectSingleFace(
        canvas,
        new fa.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }),
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!result) return null;
    return Array.from(result.descriptor as Float32Array);
  } catch {
    return null;
  }
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}
