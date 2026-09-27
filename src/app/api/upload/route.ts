import { auth } from "@/auth";
import cloudinary, { isCloudinaryConfigured } from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Validates binary magic signatures to prevent file spoofing.
 */
function isValidImageBuffer(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  // PNG: 89 50 4E 47
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  // GIF: 47 49 46 (GIF)
  const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  // WebP: RIFF ... WEBP
  const isWebp =
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // WEBP
  // SVG: contains <svg
  const isSvg =
    mimeType === "image/svg+xml" &&
    buffer.slice(0, 1000).toString("utf-8").toLowerCase().includes("<svg");

  return isJpeg || isPng || isGif || isWebp || isSvg;
}

export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 2. MIME type check
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType) || !mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: `Forbidden file type (${file.type || "unknown"}). Only image files (JPEG, PNG, WebP, GIF) are allowed.` },
        { status: 400 }
      );
    }

    // 3. File size check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image file exceeds maximum allowable size (10 MB)." },
        { status: 400 }
      );
    }

    // 4. Validate binary magic bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isValidImageBuffer(buffer, mimeType)) {
      return NextResponse.json(
        { error: "Corrupted or invalid image header. Please upload a genuine image file." },
        { status: 400 }
      );
    }

    // 5. Cloudinary environment verification
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: "Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
        },
        { status: 500 }
      );
    }

    // 6. Upload directly to Cloudinary via upload stream
    const sanitizedFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, "");
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `linkle/${sanitizedFolder}`,
          resource_type: "image",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Failed to stream to Cloudinary"));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during photo upload" },
      { status: 500 }
    );
  }
}
