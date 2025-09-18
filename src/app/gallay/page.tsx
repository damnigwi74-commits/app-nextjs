"use client";

import { useEffect, useState } from "react";
import ImageCard from "./../../components/ImageCard";

type ImageType = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
};

export default function Home() {
  const [images, setImages] = useState<ImageType[]>([]);

  useEffect(() => {
    async function fetchImages() {
      const res = await fetch("/api/images");
      const data = await res.json();
      setImages(data);
    }
    fetchImages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h2 className="text-4xl font-bold mb-4 text-blue-600">
          Discover Your Next Adventure
        </h2>
        <p className="text-gray-700 mb-6">
          We provide unforgettable touring experiences worldwide.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700">
          Book Now
        </button>
      </section>

      {/* Gallery */}
      <section className="grid md:grid-cols-3 gap-8">
        {images.map((img) => (
          <ImageCard
            key={img.id}
            title={img.title}
            description={img.description}
            imageUrl={img.imageUrl}
          />
        ))}
      </section>
    </div>
  );
}
