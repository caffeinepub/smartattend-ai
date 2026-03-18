// Type declarations for face-api.js loaded from CDN
declare namespace faceapi {
  const nets: {
    tinyFaceDetector: {
      loadFromUri(url: string): Promise<void>;
      isLoaded: boolean;
    };
    faceLandmark68Net: {
      loadFromUri(url: string): Promise<void>;
      isLoaded: boolean;
    };
    faceRecognitionNet: {
      loadFromUri(url: string): Promise<void>;
      isLoaded: boolean;
    };
  };

  class TinyFaceDetectorOptions {
    constructor(opts?: { inputSize?: number; scoreThreshold?: number });
  }

  interface FaceDetection {
    score: number;
    box: { x: number; y: number; width: number; height: number };
  }

  // biome-ignore lint/complexity/noBannedTypes: empty interface needed for face-api compatibility
  type FaceLandmarks68 = {};

  interface WithFaceDescriptor<T> {
    descriptor: Float32Array;
    detection: FaceDetection;
  }

  type WithFaceLandmarks<T, U> = T & { landmarks: U };

  function detectSingleFace(
    input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
    options?: TinyFaceDetectorOptions,
  ): {
    withFaceLandmarks(): {
      withFaceDescriptor(): Promise<
        | (WithFaceLandmarks<{ detection: FaceDetection }, FaceLandmarks68> & {
            descriptor: Float32Array;
          })
        | undefined
      >;
    };
  };
}
