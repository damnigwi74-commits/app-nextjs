import { NextResponse } from "next/server";
import images from "@/data/images.json";

export async function GET() {
  return NextResponse.json(images);
}
