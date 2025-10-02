// app/api/destinations/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/services/mongodb";
import Destination from "@/models/Destination";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import multer from "multer";
import { Readable } from "stream";

const upload = multer();

export const POST = async (req: Request) => {
  await connectDB();
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const country = formData.get("country") as string;
  const description = formData.get("description") as string;
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const client = mongoose.connection.getClient();
  const db = client.db();
  const bucket = new GridFSBucket(db, { bucketName: "images" });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadStream = bucket.openUploadStream(file.name);
  const readableFile = new Readable();
  readableFile.push(buffer);
  readableFile.push(null);
  readableFile.pipe(uploadStream);

  return new Promise((resolve, reject) => {
    uploadStream.on("finish", async () => {
      const destination = await Destination.create({
        name,
        country,
        description,
        imageId: uploadStream.id.toString(),
      });
      resolve(NextResponse.json(destination));
    });
    uploadStream.on("error", reject);
  });
};

export const GET = async () => {
  await connectDB();
  const destinations = await Destination.find().lean();
  return NextResponse.json(destinations);
};
