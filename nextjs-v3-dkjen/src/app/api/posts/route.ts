import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all posts
export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

// POST new post
export async function POST(req: Request) {
  const { title, content } = await req.json();
  const post = await prisma.post.create({
    data: { title, content },
  });
  return NextResponse.json(post);
}
