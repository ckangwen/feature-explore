// https://help.backblaze.com/hc/en-us/articles/360047425453-Getting-Started-with-the-S3-Compatible-API
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { fileTypeFromBlob } from "file-type";
import { XhrHttpHandler } from "@aws-sdk/xhr-http-handler";
import { Upload } from "@aws-sdk/lib-storage";

const b2 = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT,
  region: "ap-east-1",
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
  },
  requestHandler: new XhrHttpHandler(),
});

function getUploadThingUrl(filename: string) {
  return `${process.env.BACKBLAZE_FILE_URL!}/${filename}`;
}

export async function uploadThing(
  file: File,
  onUploadProgress?: (progress: number) => void
) {
  const fileBlob = file.slice(0, file.size);
  const { ext = "", mime = "b2/x-auto" } =
    (await fileTypeFromBlob(fileBlob)) || {};
  const filename = `${Date.now().toString()}.${ext}`;
  const upload = new Upload({
    client: b2,
    params: {
      Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
      Key: filename,
      Body: fileBlob,
      ContentType: mime,
    },
  });
  upload.on("httpUploadProgress", (e) => {
    if (typeof onUploadProgress === "function") {
      const loaded = e.loaded ?? 0;
      const total = e.total ?? 0;
      const progress = (loaded / total) * 100;
      onUploadProgress(progress);
    }
  });

  await upload.done();

  return getUploadThingUrl(filename);
}

export function deleteThing(filename: string) {
  return b2.send(
    new DeleteObjectCommand({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME,
      Key: filename,
    })
  );
}
