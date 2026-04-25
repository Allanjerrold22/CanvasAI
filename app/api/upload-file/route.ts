import { NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

/**
 * POST /api/upload-file
 * Saves an uploaded file to public/uploads/ so it can be served statically.
 * Returns the public URL for the file.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique filename to avoid collisions
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${timestamp}-${safeName}`;

    // Save to public/sample-pdfs/
    const uploadsDir = path.join(process.cwd(), "public", "sample-pdfs");
    const filePath = path.join(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/sample-pdfs/${fileName}`;

    return Response.json({
      url: publicUrl,
      fileName: file.name,
      savedAs: fileName,
      size: file.size,
    });
  } catch (err) {
    console.error("[upload-file] Error:", err);
    return Response.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }
}
