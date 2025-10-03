"use client";

import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import BookingForm from "@/components/BookWithUs"

import TourCard from "@/components/TourCard";
import TestimonialSection from "@/components/TestimonialSection";
import WhyTravel from "@/components/WhyTravel";
import AfricaWildlifeHero from "@/components/AfricaWildlifeHero";

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

      <section className="mx-5">
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


      <section className="mx-5">
        <TourCard />
      </section>

      <section className="mx-5">
        <TestimonialSection
          subtitle="What others think about our experiences!"
          title="Check the recommendations from other travelers"
          description="Because each Safari is unique to us. Our greatest commitment and reward is the traveler's satisfaction. We live with enthusiasm, passion, and commitment to each of the Journey we organize. Your feelings, happiness, and memories after the Safari make you forget all your sorrows and the eye never forgets what the heart has seen."
          image="holder.jpg"
          alt="Traveler testimonial"
          text="Hello! We are the Pashanovi family from Bulgaria. We visited Kenya in February 2021! We were kindly greeted by the amazing Naomi, who was our guide along with Francis! We had the pleasure of being 2 days guests in Nairobi, where we spent an amazing time at the zoo, the giraffe park and a dinner at the Safari Park Hotel."
          author="Pashanovavania - Kenya 2021"
          link="#"
        />

      </section>

      <section className="mx-5">
        <WhyTravel />
      </section>
      <section className="mx-5"><AfricaWildlifeHero /></section>


    </div>
  );
}
