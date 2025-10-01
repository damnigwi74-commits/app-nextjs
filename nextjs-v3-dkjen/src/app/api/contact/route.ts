import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { fullName, email, subject, message } = await req.json();

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: "Full name, email, and message are required" },
        { status: 400 }
      );
    }

    console.log("📨 New contact submission:", { fullName, email, subject, message });
    const contact = await prisma.contact.create({
      data: { fullName, email, subject, message },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("❌ Error in contact POST:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}



// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const { fullName, email, subject, message } = await req.json();

//     if (!fullName || !email || !message) {
//       return NextResponse.json(
//         { error: "Full name, email, and message are required" },
//         { status: 400 }
//       );
//     }

//     const contact = await prisma.contact.create({
//       data: { fullName, email, subject, message },
//     });

//     return NextResponse.json(contact, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
//   }
// }
