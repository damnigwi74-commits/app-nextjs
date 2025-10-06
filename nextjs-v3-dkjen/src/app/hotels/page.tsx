"use client";

import { useState, useEffect, useMemo } from "react";
import ImageCard from "@/components/ImageCard";
import fallbackHotels from "@/data/hotel.json";
import Link from "next/link";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch from API (with fallback)
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await fetch("/api/hotels");
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        setHotels(data.hotels || data?.hotels || []);
      } catch (err) {
        console.error("❌ API fetch failed, using local JSON:", err);
        setHotels(fallbackHotels.hotels);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  // Filter hotels based on query
  const filteredHotels = useMemo(() => {
    if (!query.trim()) return hotels;
    const q = query.toLowerCase();
    return hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(q) ||
        hotel.description.toLowerCase().includes(q)
    );
  }, [query, hotels]);

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500 text-lg">Loading hotels...</div>
    );

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Hotels in Kenya</h1>

      {/* 🔍 Search */}
      <div className="flex justify-between items-center py-6 mb-8 ">
         <div className="max-w-md ">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by hotel name or description..."
          className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        </div>
        <Link href="/hotels/new" className=" px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
          + Add Hotel
        </Link>

      </div>

      {/* 🏨 Hotels Grid */}
      {filteredHotels.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <ImageCard
              key={hotel.id}
              id={hotel.id}
              title={hotel.name}
              description={hotel.description}
              imageUrl={hotel.imageUrl || hotel.images?.[0]?.url}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hotels found for “{query}”.</p>
      )}
    </div>
  );
}
