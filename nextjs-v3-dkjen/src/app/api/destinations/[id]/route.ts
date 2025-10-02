// app/api/images/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/services/mongodb";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  await connectDB();
  const client = mongoose.connection.getClient();
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  const fileId = new mongoose.Types.ObjectId(params.id);
  const downloadStream = bucket.openDownloadStream(fileId);

  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(
        new NextResponse(buffer, {
          headers: { "Content-Type": "image/jpeg" },
        })
      );
    });
    downloadStream.on("error", reject);
  });
};
