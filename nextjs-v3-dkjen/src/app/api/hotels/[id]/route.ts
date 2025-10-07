import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";

// 🟢 GET hotel by ID
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: Number(params.id) },
    });

    if (!hotel)
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });

    return NextResponse.json(hotel);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hotel" }, { status: 500 });
  }
}

// ✏️ UPDATE hotel
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await prisma.hotel.update({
      where: { id: Number(params.id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update hotel" }, { status: 500 });
  }
}

// ❌ DELETE hotel
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.hotel.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete hotel" }, { status: 500 });
  }
}
