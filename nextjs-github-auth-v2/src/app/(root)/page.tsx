
import SearchForm from "@/components/SearchForm";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <section className="text-center mb-12">
        <h1 className="heading">Discover Your Next Adventure</h1>
        <p className="mt-4 text-lg text-gray-600">Explore beautiful destinations with us.</p>

        <Link href="/">
          <button className="bg-blue-400 text-white px-6 py-3 m-10 rounded-lg shadow-md hover:bg-blue-500">
            View Hotels
          </button>
        </Link>

        <SearchForm />
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        
      </section>
    </div>
  );
}
