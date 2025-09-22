// app/hotels/page.tsx
import ImageCard from "@/components/ImageCard";
import hotels from "@/data/hotel.json"; // <-- put your JSON here

export default function HotelsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Hotels in Kenya</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {hotels.hotels.map((hotel) => (
          <ImageCard
            key={hotel.id}
            id={hotel.id}
            title={hotel.name}
            description={hotel.description}
            imageUrl={hotel.images[0].url}
          />
        ))}
      </div>
    </div>
  );
}
