import { useState, useRef } from "react";
import { useEvent } from "hooks";
import { uploadThing } from "../api";

export type UseUploadThingProps = {
  onComplete?: (url: string) => void;
  onProgress?: (p: number) => void;
  onError?: (e: Error) => void;
};

export function useUploadThing(opts?: UseUploadThingProps) {
  const [isUploading, setUploading] = useState(false);
  const uploadProgress = useRef(0);
  const fileProgress = useRef<Map<string, number>>(new Map());

  const startUpload = useEvent(async (file: File) => {
    setUploading(true);

    try {
      const res = await uploadThing(file, (progress) => {
        if (!opts?.onProgress) return;
        fileProgress.current.set(file.name, progress);
        let sum = 0;
        fileProgress.current.forEach((p) => {
          sum += p;
        });
        const averageProgress =
          Math.floor(sum / fileProgress.current.size / 10) * 10;
        if (averageProgress !== uploadProgress.current) {
          opts?.onProgress?.(averageProgress);
          uploadProgress.current = averageProgress;
        }
      });

      setUploading(false);
      fileProgress.current = new Map();
      uploadProgress.current = 0;
      opts?.onComplete?.(res);
      return res;
    } catch (e) {
      setUploading(false);
      fileProgress.current = new Map();
      uploadProgress.current = 0;
      opts?.onError?.(e as Error);
      return;
    }
  });

  return {
    startUpload,
    isUploading,
  };
}
