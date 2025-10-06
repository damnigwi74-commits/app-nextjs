"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"

export default function HotelsPage() {

  const router = useRouter();


  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🖼️ Preview gallery
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(false)
    const files = Array.from(e.target.files || []);
    setGallery(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleRemoveImage = (index: number) => {
    setLoading(false)
    setGallery(gallery.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("check_in", checkIn);
    formData.append("check_out", checkOut);
    formData.append("city", city);
    formData.append("address", address);
    if (coverImage) formData.append("coverImage", coverImage);
    gallery.forEach((file) => formData.append("images", file));

    const res = await fetch("/api/hotels/create", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      setMessage("✅ Hotel created successfully!");
      setName("");
      setDescription("");
      setCoverImage(null);
      setGallery([]);
      setPreviewImages([])
      setLoading(false)

      // Navigate after a short delay
        setTimeout(() => router.push("/hotels"), 1);
    } else {
      setLoading(false)
      setMessage("❌ Error: " + data.error);
    }

  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 mt-10">
      <h1 className="text-2xl font-semibold">Add New Hotel</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BASIC INFO */}
        <div className="gap-2">

          <div>
            <label className="block font-medium mb-4">Hotel Name</label>
            <input
              type="text"
              name="name"
              className="border p-2 w-full rounded"
              placeholder="Hotel Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-4">Description</label>
            <textarea
              name="description"
              className="border p-2 w-full rounded"
              rows={3}
              placeholder="Brief hotel description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>
        {/* Location INFO */}
        <label className="block font-medium mb-4 underline">Location Details: </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium mb-1">City</label>
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              type="text"
              name="city"
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Address</label>
            <input
              placeholder="Address"
              value={address} onChange={(e) => setAddress(e.target.value)}
              type="text"
              name="address"
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <input />
        </div>
        {/* Check INFO */}
        <label className="block font-medium mb-4 underline">Check In/ Check-Out: </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-medium mb-1">Check In</label>
            <input
              placeholder="Check-in"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              type="time"
              name="checkin"
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Check-out</label>
            <input
              placeholder="Check-out"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
               type="time"
              name="checkout"
              className="border p-2 w-full rounded"
              required
            />
          </div>

        
        </div>

        {/* Cover Image */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            className="border p-2 w-full rounded"
          />
          {coverImage && <img src={URL.createObjectURL(coverImage)} alt="cover" className="mt-2 w-48 rounded-lg shadow" />}
        </div>

        {/* Gallery Upload */}
        <div className="flex flex-col gap-1">
          <label className="font-medium">Gallery Images</label>
          <input className="border p-2 w-full rounded" multiple type="file" accept="image/*" onChange={handleGalleryChange} />
          <div className="flex flex-wrap gap-3 mt-2">
            {previewImages.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-32 h-24 object-cover rounded shadow" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
                  onClick={() => handleRemoveImage(i)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Hotel"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
