import Card from "@/components/Card";
import images from "@/data/images.json";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-600">Discover Your Next Adventure</h1>
        <p className="mt-4 text-lg text-gray-600">Explore beautiful destinations with us.</p>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {images.map((item) => (
          <Card
            key={item.id}
            title={item.title}
            description={item.description}
            imageUrl={item.imageUrl}
          />
        ))}
      </section>
    </div>
  );
}
