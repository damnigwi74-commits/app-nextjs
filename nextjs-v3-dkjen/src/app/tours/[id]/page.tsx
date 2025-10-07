// app/hotels/[id]/page.tsx
import hotels from "@/data/hotel.json"
import Image from "next/image";

type Props = {
  params: { id: number };
};

export default function TourDetails({ params }: Props) {
  const hotel = hotels.hotels.find((h) => h.id === params.id);

  if (!hotel) {
    return <div className="p-8">Hotel not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{hotel.name}</h1>
      <Image
        src={hotel.images[0].url}
        alt={hotel.name}
        width={800}
        height={500}
        className="rounded-xl mb-6"
      />
      <p className="text-lg mb-4">{hotel.description}</p>

      <h2 className="text-xl font-semibold mb-2">Rooms & Rates</h2>
      <ul className="mb-6 space-y-2">
        {hotel.rooms.map((room) => (
          <li
            key={room.type}
            className="border rounded-lg p-4 bg-gray-50 shadow-sm"
          >
            <p className="font-medium">{room.type}</p>
            <p>Bed: {room.bed_type}</p>
            <p>Max Occupancy: {room.max_occupancy}</p>
            <p className="text-green-700">
              Rate: ${room.sample_rate_usd_per_night} / night
            </p>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Facilities</h2>
      <ul className="list-disc list-inside mb-6">
        {hotel.facilities.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Contact</h2>
      <p>Phone: {hotel.contact.phone}</p>
      <p>
        Website:{" "}
        <a
          href={hotel.contact.website}
          className="text-blue-600 underline"
          target="_blank"
        >
          {hotel.contact.website}
        </a>
      </p>
    </div>
  );
}
