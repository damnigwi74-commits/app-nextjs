import { ChevronLeft, ChevronRight } from "lucide-react";

type TestimonialProps = {
  subtitle: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  text: string;
  author: string;
  link?: string;
};

export default function TestimonialSection({
  subtitle,
  title,
  description,
  image,
  alt,
  text,
  author,
  link,
}: TestimonialProps) {
  return (
    <section className="bg-gray-100 py-12 px-6 rounded-xl">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-lg italic text-orange-600">{subtitle}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">
          {title}
        </h2>
        <p className="text-gray-600 mt-4">{description}</p>
      </div>

      {/* Testimonial Content */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        {/* Image */}
        <div className="w-[220px] h-[220px] overflow-hidden rounded-full flex-shrink-0">
          <img
            src={image}
            alt={alt}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="max-w-2xl text-center md:text-left">
          <p className="text-gray-700 mb-4">
            {text}{" "}
            {link && (
              <a
                href={link}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Continue reading...
              </a>
            )}
          </p>
          <p className="font-semibold text-gray-800">{author}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-8">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-500">
          <ChevronLeft size={20} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white hover:bg-gray-500">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
