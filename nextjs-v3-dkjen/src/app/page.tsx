"use client";

import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import BookingForm from "@/components/BookWithUs"
import hotels from "@/data/hotel.json"
import TourCard from "@/components/TourCard";

export default function HomePage() {
  const slides = [
    {
      src: "https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg",
      text: "Discover Africa",
    },
    {
      src: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      text: "Adventure Awaits",
    },
    {
      src: "https://images.pexels.com/photos/417142/pexels-photo-417142.jpeg",
      text: "Luxury in the Wild",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slides: { perView: 1 },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 400);
        }

        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <div className="min-h-screen ">

      <section>
        <div className="relative">
          {/* Slider */}
          <div
            ref={sliderRef}
            className="keen-slider w-full h-[50vh] sm:h-[60vh] md:h-[80vh]"
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="keen-slider__slide relative w-full h-[50vh] sm:h-[60vh] md:h-[80vh]"
              >
                <Image
                  src={slide.src}
                  alt={`Slide ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
                {/* Overlay text */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h2 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold text-center px-4">
                    {slide.text}
                  </h2>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow */}
          <button
            onClick={() => instanceRef.current?.prev()}
            className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => instanceRef.current?.next()}
            className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>
        </div>
      </section>


      <section className="">
        <BookingForm />
      </section>

      <section className="my-5">
        <div className="container mx-auto px-4 py-8 mt-5 text-center">
          {/* Heading */}
          <h1 className="text-2xl font-bold mb-4 italic text-amber-950" >`A Dream of an Africa safari ! </h1>
          <h1 className="text-3xl font-bold mb-4">Popular Destinations</h1>

          {/* Description */}
          <p className="text-md text-gray-600 italic mb-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit a laudantium id veritatis magni aspernatur nihil excepturi mollitia, vel magnam deserunt consectetur eum molestiae error nisi laboriosam possimus. Asperiores, doloremque. Lorem ipsum dolor sit amet consectetur adipisicing elit. Est quisquam tempore ea animi voluptatem sint nisi blanditiis voluptatibus a quasi cum, delectus velit deserunt quis. Magni eligendi possimus doloribus voluptatibus.
          </p>

          {/* Extra heading */}
          <h2 className="text-xl font-semibold mb-2">
            Looking for a dream safari holiday?
          </h2>

          {/* Extra paragraph */}
          <p className="text-gray-700">
            Africa is our home & let Expert Guides Help you to showcase our planet, With more than 10 Years' Experience, you are in for Magical Moments!
          </p>
        </div>
      </section>


      <section className="my-5">
        <div className="container mx-auto px-4 py-8 mt-5">
          {/* Section Title */}
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center border-b-4 border-yellow-500 inline-block pb-2">
            Top Tours and Safari Packages
          </h2>

          {/* Grid of Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
            {hotels.hotels.map((hotel) => (
              <TourCard
                key={hotel.id}
                id={hotel.id}
                title={hotel.name}
                description={hotel.description}
                imageUrl={hotel.images[0].url}
                price="299"
              />
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
