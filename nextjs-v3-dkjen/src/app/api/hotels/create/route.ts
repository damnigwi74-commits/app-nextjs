import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

// Ensure local uploads folder exists
const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export async function POST1(req: Request) {
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





export async function POST(req: Request) {
  const form = await req.formData();

  const name = form.get("name") as string;
  const description = form.get("description") as string;
  const city = form.get("city") as string;
  const address = form.get("address") as string;
  const hotel_id = form.get("hotel_id") as string;
  const check_in = form.get("check_in") as string;
  const check_out = form.get("check_out") as string;
  const latitude = form.get("latitude") ? parseFloat(form.get("latitude") as string) : null;
  const longitude = form.get("longitude") ? parseFloat(form.get("longitude") as string) : null;

  const facilities = form.get("facilities");
  const dining = form.get("dining");
  const policies = form.get("policies");
  const contact = form.get("contact");

  const coverImage = form.get("coverImage") as File | null;
  const images = form.getAll("images") as File[];

  let coverImageUrl = "";
  const uploadDir = path.join(process.cwd(), "public/uploads");

  // Save cover image locally
  if (coverImage) {
    const bytes = await coverImage.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, coverImage.name);
    //await writeFile(filePath, buffer);
    fs.writeFileSync(filePath, buffer);
    coverImageUrl = `/uploads/${coverImage.name}`;
  }

  const imageUrls: string[] = [];
  for (const file of images) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, file.name);
    //await writeFile(filePath, buffer);
    fs.writeFileSync(filePath, buffer);
    imageUrls.push(`/uploads/${file.name}`);
  }

  try {
    const hotel = await prisma.hotel.create({
      data: {
        hotel_id,
        name,
        description,
        city,
        address,
        check_in,
        check_out,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        coverImageUrl,
        images: imageUrls.length ? imageUrls : undefined,
        facilities: facilities ? JSON.parse(facilities as string) : undefined,
        dining: dining ? JSON.parse(dining as string) : undefined,
        policies: policies ? JSON.parse(policies as string) : undefined,
        contact: contact ? JSON.parse(contact as string) : undefined,
      },
    });

    return NextResponse.json({ success: true, hotel });
  } catch (error: any) {
    console.error("❌ Hotel creation error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
