import Image from "next/image";

type Props = {
  title: string;
  description: string;
  imageUrl: string;
};

export default function ImageCard({ title, description, imageUrl }: Props) {
  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:scale-105 transition-transform">
      <Image
        src={imageUrl}
        alt={title}
        width={400}
        height={300}
        className="w-full h-56 object-cover"
      />
      <div className="p-4 bg-white">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
}
