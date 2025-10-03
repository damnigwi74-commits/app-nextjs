// components/WhyTravel.tsx
import Image from "next/image";
import React from "react";
import { CheckCircle2 } from "lucide-react";

type WhyTravelProps = {
  title?: string;
  featuresLeft?: string[];
  featuresRight?: string[];
};

const defaultLeft = [
  "VALUE-FOR-MONEY SAFARIS",
  "24 HOUR ASSISTANCE",
  "OUR SAFARI GUIDE DRIVERS",
];

const defaultRight = [
  "CUSTOMIZED EXCURSIONS",
  "EAST AFRICA SAFARI SPECIALIST",
  "WE ARE AFRICAN",
];



export default function WhyTravel({
  title = "Why travel with us?",
  featuresLeft = defaultLeft,
  featuresRight = defaultRight,
}: WhyTravelProps) {
  return (
    <section className="py-12 border-t border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            {title}
          </h2>
        </div>

        {/* Content grid: left features | center features | badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left features column */}
          <div className="space-y-8 md:pl-6">
            {featuresLeft.map((f, i) => (
              <div key={i} className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-600 w-7 h-7" />
                <span className="text-gray-700 text-left">{f}</span>
              </div>
            ))}
          </div>

          {/* Middle features column */}
          <div className="space-y-8">
            {featuresRight.map((f, i) => (
              <div key={i} className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-600 w-7 h-7" />
                <span className="text-gray-700 text-left">{f}</span>
              </div>
            ))}
          </div>

          {/* Right badges column */}
           <div className="flex flex-col items-center md:items-end gap-8">
          
            <Image
              src="/holder.jpg"
              alt="Tripadvisor 2020 Travelers Choice"
              width={160}
              height={160}
              className="object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
