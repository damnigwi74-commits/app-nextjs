// import { NextResponse } from "next/server";
// import images from "@/data/hotel.json";

// export async function GET() {
//   return NextResponse.json(images);
// }


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import hotels from "@/data/hotel.json"; // fallback data

const prisma = new PrismaClient();

// 🟢 GET - fetch all hotels
export async function GET() {
  try {
    const dbHotels = await prisma.hotel.findMany();
    return NextResponse.json({ hotels: dbHotels });
  } catch (error) {
    console.error("⚠️ Database fetch failed. Using fallback JSON.", error);
    return NextResponse.json(hotels); // fallback to local JSON
  }
}
