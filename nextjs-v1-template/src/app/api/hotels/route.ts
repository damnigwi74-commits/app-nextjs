import { NextResponse } from "next/server";
import images from "@/data/hotel.json";

export async function GET() {
  return NextResponse.json(images);
}
