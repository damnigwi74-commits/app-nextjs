// components/TourCard.tsx
import Image from "next/image";
import Link from "next/link";

type Props = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
};

export default function TourCard({ id, title, description, imageUrl,price }: Props) {
  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
      {/* Image with title overlay */}
      <div className="relative w-full h-56">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-3 py-2">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
         <h1 className="text-lg font-semibold">KES {price}</h1>
        <p className="text-gray-600 text-sm line-clamp-4">{description}</p>

        {/* Full-width Button with margin */}
        <Link
          href={`/tours/${id}`}
          className="mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition text-center mx-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
