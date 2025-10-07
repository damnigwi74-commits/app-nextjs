/** */
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
        hotel_id: h.hotel_id ?? h.id, // Use h.hotel_id if present, otherwise fallback to h.id
        name: h.name,
        description: h.description,
        coverImageUrl: h.images?.[0]?.url,
        city: h.location?.city,
        address: h.location?.address,
        latitude: h.location?.latitude,
        longitude: h.location?.longitude,
        images: h.images,
        rooms: h.rooms,
        facilities: h.facilities,
        dining: h.dining,
        policies: h.policies,
        contact: h.contact,
        check_in: h.check_in ?? "14:00", // Provide a default or use value from data
        check_out: h.check_out ?? "12:00", // Provide a default or use value from data
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

  //HOW TO RUN ABOVE : npx prisma db seed