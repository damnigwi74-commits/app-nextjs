export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">Contact Us</h1>
      <form className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-6 space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-3 rounded-lg"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border p-3 rounded-lg"
        />
        <textarea
          placeholder="Your Message"
          rows={4}
          className="w-full border p-3 rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
