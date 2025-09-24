import React from 'react'
import hotels from "@/data/hotel.json"
import TourCard from "@/components/TourCard";

const Tours = () => {
  return (
    <div>
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
  )
}

export default Tours