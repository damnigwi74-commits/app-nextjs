"use client";
import { useState } from "react";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, subject, message }),
    });

    if (res.ok) {
      setStatus("✅ Message sent successfully!");
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      setStatus("❌ Failed to send message. Try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <textarea
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border p-2 rounded h-32"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Send
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}





// export default function ContactPage() {
//   return (
//     <div className="max-w-5xl mx-auto px-6 py-12">
//       <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">Contact Us</h1>
//       <form className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4">
//         <input
//           type="text"
//           placeholder="Your Name"
//           className="w-full border p-3 rounded-lg"
//         />
//         <input
//           type="email"
//           placeholder="Your Email"
//           className="w-full border p-3 rounded-lg"
//         />
//         <textarea
//           placeholder="Your Message"
//           rows={4}
//           className="w-full border p-3 rounded-lg"
//         />
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
//         >
//           Send Message
//         </button>
//       </form>
//     </div>
//   );
// }
