import "server-only";
import sharp from "sharp";
import { db } from "./db";
import type { UploadKind } from "@/generated/prisma/enums";

const MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export class UploadError extends Error {
  constructor(public code: "too_large" | "bad_type" | "unreadable") {
    super(code);
  }
}

export function hasFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "size" in value && value.size > 0;
}

/**
 * Stores an upload in Postgres so the shop runs on any host without separate file storage.
 * Photos are resized and re-encoded to WebP; a PDF bank slip is kept as-is.
 */
export async function storeUpload(file: File, kind: UploadKind) {
  if (file.size > MAX_BYTES) throw new UploadError("too_large");

  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    if (kind !== "SLIP") throw new UploadError("bad_type");
    return db.upload.create({
      data: { kind, mime: "application/pdf", size: buffer.length, data: buffer },
      select: { id: true },
    });
  }

  if (file.type && !IMAGE_TYPES.includes(file.type)) throw new UploadError("bad_type");

  const maxEdge = kind === "SLIP" ? 2000 : 1600;
  try {
    const { data, info } = await sharp(buffer)
      .rotate()
      .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
      .webp({ quality: kind === "SLIP" ? 85 : 82 })
      .toBuffer({ resolveWithObject: true });

    return db.upload.create({
      data: {
        kind,
        mime: "image/webp",
        width: info.width,
        height: info.height,
        size: data.length,
        data,
      },
      select: { id: true },
    });
  } catch {
    throw new UploadError("unreadable");
  }
}
