"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

type Room = {
  type: string;
  bed_type: string;
  max_occupancy: number;
  sample_rate_usd_per_night: number;
  notes?: string;
};

export default function CreateHotelPage() {
  const router = useRouter();

  // BASIC FIELDS
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // IMAGES
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // STRUCTURED JSON FIELDS
  const [facilities, setFacilities] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState("");

  const [dining, setDining] = useState<string[]>([]);
  const [diningInput, setDiningInput] = useState("");

  const [policies, setPolicies] = useState({
    pets: false,
    smoking: false,
    loud_music: false,
    alcohol: false,
  });

  const [contact, setContact] = useState({
    phone: "",
    email: "",
    website: "",
  });

  //ROOMS
   const [rooms, setRooms] = useState<Room[]>([]);
  const [showRooms, setShowRooms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🖼️ GALLERY
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setGallery(files);
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleRemoveImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  };

  // ✅ Add/Remove Facilities
  const addFacility = () => {
    if (facilityInput.trim()) {
      setFacilities([...facilities, facilityInput.trim()]);
      setFacilityInput("");
    }
  };
  const removeFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index));
  };

  // ✅ Add/Remove Dining
  const addDining = () => {
    if (diningInput.trim()) {
      setDining([...dining, diningInput.trim()]);
      setDiningInput("");
    }
  };
  const removeDining = (index: number) => {
    setDining(dining.filter((_, i) => i !== index));
  };


  const addRoom = () => {
    setRooms([
      ...rooms,
      { type: "", bed_type: "", max_occupancy: 1, sample_rate_usd_per_night: 0, notes: "" },
    ]);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const updateRoom = <K extends keyof Room>(index: number, field: K, value: Room[K]) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  // ✅ Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const hotel_id = uuidv4();
    const formData = new FormData();

    formData.append("hotel_id", hotel_id);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("city", city);
    formData.append("address", address);
    formData.append("check_in", checkIn);
    formData.append("check_out", checkOut);

    if (latitude !== "") formData.append("latitude", latitude.toString());
    if (longitude !== "") formData.append("longitude", longitude.toString());
    if (coverImage) formData.append("coverImage", coverImage);
    gallery.forEach((file) => formData.append("images", file));

    // STRUCTURED JSON FIELDS
    if (facilities.length > 0) formData.append("facilities", JSON.stringify(facilities));
    if (dining.length > 0) formData.append("dining", JSON.stringify(dining));
    formData.append("policies", JSON.stringify(policies));
    formData.append("contact", JSON.stringify(contact));

    try {
      const res = await fetch("/api/hotels/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Hotel created successfully!");
        setLoading(false);
        setTimeout(() => router.push("/hotels"), 800);
      } else throw new Error(data.error || "Unknown error");
    } catch (err: any) {
      setLoading(false);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 mt-10">
      <h1 className="text-2xl font-semibold">🧳 Add New Hotel</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFO */}
        <section>
          <label className="block font-medium mb-2">Hotel Name</label>
          <input
            type="text"
            className="border p-2 w-full rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="block font-medium mt-4 mb-2">Description</label>
          <textarea
            className="border p-2 w-full rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </section>

        {/* LOCATION */}
        <section>
          <h2 className="font-semibold underline mb-2">Location</h2>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              placeholder="Latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="border p-2 rounded"
            />
            <input
              placeholder="Longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="border p-2 rounded"
            />
          </div>
        </section>

        {/* CHECK IN/OUT */}
        <section>
          <h2 className="font-semibold underline mb-2">Check In / Out</h2>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="border p-2 rounded"
              required
            />
          </div>
        </section>

        {/* IMAGES */}
        <section>
          <h2 className="font-semibold underline mb-2">Images</h2>
          <div>
            <label className="block font-medium mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
            />
            {coverImage && (
              <img
                src={URL.createObjectURL(coverImage)}
                className="w-48 mt-2 rounded-lg shadow"
              />
            )}
          </div>
          <div className="mt-4">
            <label className="block font-medium mb-1">Gallery Images</label>
            <input multiple type="file" accept="image/*" onChange={handleGalleryChange} />
            <div className="flex flex-wrap gap-3 mt-3">
              {previewImages.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="w-32 h-24 object-cover rounded shadow" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 py-0.5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FACILITIES */}
        <section>
          <h2 className="font-semibold underline mb-2">Facilities</h2>
          <div className="flex gap-2">
            <input
              value={facilityInput}
              onChange={(e) => setFacilityInput(e.target.value)}
              placeholder="e.g. WiFi, Pool"
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={addFacility}
              className="bg-blue-500 text-white px-3 rounded"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {facilities.map((f, i) => (
              <li
                key={i}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {f}
                <button type="button" onClick={() => removeFacility(i)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* DINING */}
        <section>
          <h2 className="font-semibold underline mb-2">Dining Options</h2>
          <div className="flex gap-2">
            <input
              value={diningInput}
              onChange={(e) => setDiningInput(e.target.value)}
              placeholder="e.g. Restaurant, Bar"
              className="border p-2 rounded flex-1"
            />
            <button
              type="button"
              onClick={addDining}
              className="bg-blue-500 text-white px-3 rounded"
            >
              Add
            </button>
          </div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {dining.map((d, i) => (
              <li
                key={i}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {d}
                <button type="button" onClick={() => removeDining(i)}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* POLICIES */}
        <section>
          <h2 className="font-semibold underline mb-2">Policies</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(policies).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={policies[key as keyof typeof policies]}
                  onChange={(e) =>
                    setPolicies({
                      ...policies,
                      [key]: e.target.checked,
                    })
                  }
                />
                {key.replace("_", " ").toUpperCase()}
              </label>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="font-semibold underline mb-2">Contact Info</h2>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Phone"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Website"
              value={contact.website}
              onChange={(e) => setContact({ ...contact, website: e.target.value })}
              className="border p-2 rounded col-span-2"
            />
          </div>
        </section>

        <section>
<div className="max-w-3xl mx-auto p-6">
      {/* other hotel fields here */}
      <h1 className="text-2xl font-bold mb-6">Add New Hotel</h1>

      <button
        type="button"
        onClick={() => setShowRooms(!showRooms)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showRooms ? "Hide Room Details" : "Add Room Details (Optional)"}
      </button>

      {showRooms && (
        <section className="space-y-6 border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold">Rooms</h2>

          {rooms.map((room, index) => (
            <div key={index} className="border p-4 rounded-lg bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Room Type</label>
                  <input
                    type="text"
                    value={room.type}
                    onChange={(e) => updateRoom(index, "type", e.target.value)}
                    placeholder="e.g. Deluxe Suite"
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Bed Type</label>
                  <input
                    type="text"
                    value={room.bed_type}
                    onChange={(e) => updateRoom(index, "bed_type", e.target.value)}
                    placeholder="e.g. King"
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Max Occupancy</label>
                  <input
                    type="number"
                    value={room.max_occupancy}
                    onChange={(e) => updateRoom(index, "max_occupancy", Number(e.target.value))}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Rate (USD per night)</label>
                  <input
                    type="number"
                    value={room.sample_rate_usd_per_night}
                    onChange={(e) =>
                      updateRoom(index, "sample_rate_usd_per_night", Number(e.target.value))
                    }
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-medium mb-1">Notes</label>
                  <textarea
                    value={room.notes}
                    onChange={(e) => updateRoom(index, "notes", e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Extra notes about this room (optional)"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeRoom(index)}
                className="mt-3 text-red-600 hover:underline"
              >
                Remove Room
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addRoom}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Add Room
          </button>
        </section>
      )}

     
    </div>

        </section>

        {/* SUBMIT */}
        <button
          disabled={loading}
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Hotel"}
        </button>
      </form>

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
}
