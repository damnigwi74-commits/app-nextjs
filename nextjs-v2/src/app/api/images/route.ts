// import { NextResponse } from "next/server";
// import images from "@/data/images.json";

// export async function GET() {
//   return NextResponse.json(images);
// }


import { NextResponse } from "next/server";
import images from "@/data/images.json";

// GET: Fetch all images
export async function GET() {
  return NextResponse.json(images);
}

// POST: Add a new image
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.description || !body.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newImage = {
      id: images.length + 1,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
    };

    // ⚠️ For demo only — this updates in memory, not in file system.
    images.push(newImage);

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
