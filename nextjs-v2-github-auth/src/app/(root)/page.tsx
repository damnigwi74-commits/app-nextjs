
import SearchForm from "@/components/SearchForm";
import StartupCard from "@/components/StartupCard";
import Link from "next/link";

export default async function HomePage( {searchParams}: {searchParams: Promise<{query: string}>} ) {

  const query = (await searchParams).query ;
const posts = [
  {
    _createdAt: new Date().toDateString(),
    views: 55,
    author: { _id: 1 ,name: 'Jane Smith'},
    _id: 1,
    description: "This is a description",
    image: "https://images.unsplash.com/photo-1634912314704-c646c586b131?q=80&w=2940&auto=format&fit=crop",
    category: "Robots",
    title: "We Robots",
  },
  {
    _createdAt: new Date(),
    views: 120,
    author: { _id: 2, name: 'John Doe' },
    _id: 2,
    description: "Exploring future cities with AI integration.",
    image: "https://images.unsplash.com/photo-1549921296-3f3fddf43a6c?q=80&w=2940&auto=format&fit=crop",
    category: "AI",
    title: "Smart Cities",
  },
  {
    _createdAt: new Date(),
    views: 78,
    author: { _id: 3, name: 'Alice Johnson' },
    _id: 3,
    description: "Sustainable energy powering our future.",
    image: "https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=2940&auto=format&fit=crop",
    category: "Energy",
    title: "Green Power",
  },
  {
    _createdAt: new Date(),
    views: 34,
    author: { _id: 4, name: 'Jane Smith' },
    _id: 4,
    description: "The evolution of transportation technology.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2940&auto=format&fit=crop",
    category: "Transport",
    title: "Next-Gen Cars",
  },
  {
    _createdAt: new Date(),
    views: 250,
    author: { _id: 5 ,name: 'John Doe'},
    _id: 5,
    description: "Medical breakthroughs with robotics and AI.",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e85?q=80&w=2940&auto=format&fit=crop",
    category: "Health",
    title: "Future of Medicine",
  },
  {
    _createdAt: new Date(),
    views: 99,
    author: { _id: 6 ,name: 'Alice Johnson'},
    _id: 6,
    description: "New frontiers in space exploration.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2940&auto=format&fit=crop",
    category: "Space",
    title: "Beyond Earth",
  },
  {
    _createdAt: new Date(),
    views: 64,
    author: { _id: 7,name: 'Jane Smith' },
    _id: 7,
    description: "The rise of blockchain in finance.",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c1f85?q=80&w=2940&auto=format&fit=crop",
    category: "Finance",
    title: "Blockchain Future",
  },
  {
    _createdAt: new Date(),
    views: 310,
    author: { _id: 8,name: 'John Doe' },
    _id: 8,
    description: "How education is evolving with virtual tools.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2940&auto=format&fit=crop",
    category: "Education",
    title: "Learning 4.0",
  },
];



  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      <section className="text-center mb-12">
        <h1 className="heading">Discover Your Next Adventure</h1>
         <p className="sub-heading">Explore beautiful destinations with us.</p>
        <p className="mt-4 text-lg text-gray-600">Explore beautiful destinations with us.</p>

        <Link href="/">
          <button className="bg-blue-400 text-white px-6 py-3 m-10 rounded-lg shadow-md hover:bg-blue-500">
            View Hotels
          </button>
        </Link>

        <SearchForm query = {query} />
      </section>

      <section className="section_container">
          <p className="text-30-semibold">
            {query ? `Search Results for "${query}"` : 'All Destinations'}
          </p>

          <ul className="mt-7 card_grid">
            {posts.length > 0 ? (
              posts.map((post : StartupCardType, index: number) => ( 
                <StartupCard key = {post?._id} post = {post}/>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-3">
                No destinations found.
              </p>
            )}    
          </ul>
      </section>
    </div>
  );
}
