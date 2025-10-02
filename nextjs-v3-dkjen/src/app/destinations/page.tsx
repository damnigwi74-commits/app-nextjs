// import React from 'react'

// const DestinationsPage = () => {
//   return (
//     <div className='text-center text-2xl font-bold mt-10'>
//       DestinationsPage
      
//       </div>
//   )
// }

// export default DestinationsPage


"use client";
import { useState, useEffect } from "react";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchDestinations() {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/destinations");
      if (!res.ok) throw new Error("Failed to fetch destinations");

      setDestinations(await res.json());
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/destinations", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add destination");

      await fetchDestinations();
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch destinations on mount
  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Top Destinations in Africa 🌍</h1>

      {/* Upload Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded-lg shadow-md max-w-md"
      >
        <input
          name="name"
          placeholder="Destination Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="country"
          placeholder="Country"
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-2 border rounded"
          required
        />
        <input type="file" name="image" className="w-full" required />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded shadow text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Submitting..." : "Add Destination"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg max-w-md">
          ⚠️ {error}
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="mt-6 flex justify-center">
          <div className="h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Display Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {destinations.map((d) => (
          <div
            key={d._id}
            className="border rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={`/api/images/${d.imageId}`}
              alt={d.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold">{d.name}</h2>
              <p className="text-sm text-gray-600">{d.country}</p>
              <p className="mt-2">{d.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
