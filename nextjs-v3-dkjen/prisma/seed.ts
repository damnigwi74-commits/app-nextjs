/*
import { PrismaClient } from "@prisma/client";
import hotels from "../src/data/hotel.json";

const prisma = new PrismaClient();

async function main() {
  for (const h of hotels.hotels) {
    await prisma.hotel.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        name: h.name,
        description: h.description,
        coverImageUrl: h.images?.[0]?.url,
        city: h.location?.city,
        address: h.location?.address,
        latitude: h.location?.coordinates?.latitude,
        longitude: h.location?.coordinates?.longitude,
        images: h.images,
        rooms: h.rooms,
        facilities: h.facilities,
        dining: h.dining,
        policies: h.policies,
        contact: h.contact,
      },
    });
  }

  console.log("✅ Seeded hotels successfully!");
}

main()
  .catch((e) => {
    console.error(e);})
  .finally(async () => {
    console.log("🌴 Disconnecting Prisma Client");
    await prisma.$disconnect();
  });
*/