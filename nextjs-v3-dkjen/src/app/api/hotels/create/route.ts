import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// Ensure local uploads folder exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const check_in = formData.get("check_in") as string;
    const check_out = formData.get("check_out") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const latitude = parseFloat(formData.get("latitude") as string);
    const longitude = parseFloat(formData.get("longitude") as string);

    // 🖼️ Handle image uploads
    const coverImage = formData.get("coverImage") as File | null;
    const galleryFiles = formData.getAll("images") as File[];

    let coverImageUrl = "";
    let galleryUrls: any[] = [];

    if (coverImage) {
      const coverFileName = `${randomUUID()}_${coverImage.name}`;
      const coverFilePath = path.join(uploadDir, coverFileName);
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      fs.writeFileSync(coverFilePath, buffer);
      coverImageUrl = `/uploads/${coverFileName}`;
    }

    if (galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const fileName = `${randomUUID()}_${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        galleryUrls.push({ url: `/uploads/${fileName}`, caption: "Uploaded image" });
      }
    }

    // 🏨 Save to database
    const hotel = await prisma.hotel.create({
      data: {
       // hotel_id: `hotel_${randomUUID().slice(0, 6)}`,
        hotel_id: `hotel_${randomUUID()}`,
        name,
        coverImageUrl,
        description,
        check_in,
        check_out,
        city,
        address,
        latitude,
        longitude,
        images: galleryUrls,
        location: {
          city,
          address,
          latitude,
          longitude,
        },
      },
    });

    return NextResponse.json({ success: true, hotel });
  } catch (err: any) {
    console.error("❌ Hotel creation error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
