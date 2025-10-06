"use client";

import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import React from 'react'

const HomeSlider = () => {

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
          }, 4000);
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
  )
}

export default HomeSlider