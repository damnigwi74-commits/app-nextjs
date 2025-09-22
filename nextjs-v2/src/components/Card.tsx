interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function Card({ title, description, imageUrl }: CardProps) {
  return (
    <div className="rounded-xl shadow-lg overflow-hidden bg-white">
      <img src={imageUrl} alt={title} className="w-full h-56 object-cover" />
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
