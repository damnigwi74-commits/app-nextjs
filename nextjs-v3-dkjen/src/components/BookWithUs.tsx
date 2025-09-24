"use client";

import { useState } from "react";

export default function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    destination: "",
    pax: 1,
    days: 1,
    budget: "",
    description: "",
    date: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form); // later hook this to MongoDB / API
  };

  return (
    <section className="bg-[#d9cbb8] py-6">
      <div className="container mx-auto px-4">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-8 gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />
          <input
            type="text"
            name="destination"
            placeholder="Destination"
            value={form.destination}
            onChange={handleChange}
            required
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />
          <input
            type="number"
            name="pax"
            placeholder="Pax"
            min="1"
            value={form.pax}
            onChange={handleChange}
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />
          <input
            type="number"
            name="days"
            placeholder="Days"
            min="1"
            value={form.days}
            onChange={handleChange}
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />
          <input
            type="text"
            name="budget"
            placeholder="Budget"
            value={form.budget}
            onChange={handleChange}
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="col-span-1 md:col-span-1 p-2 rounded border resize-none"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="col-span-1 md:col-span-1 p-2 rounded border"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="col-span-1 md:col-span-1 bg-[#5a3211] text-white px-4 py-2 rounded hover:bg-[#3e220c] transition"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}
