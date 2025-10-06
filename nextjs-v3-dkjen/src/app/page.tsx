
import BookingForm from "@/components/BookWithUs"

import TourCard from "@/components/TourCard";
import TestimonialSection from "@/components/TestimonialSection";
import WhyTravel from "@/components/WhyTravel";
import AfricaWildlifeHero from "@/components/AfricaWildlifeHero";
import WildlifeDestinations from "@/components/WildlifeDestinations";
import HomeSlider from "@/components/HomeSlider";

export default function HomePage() {


  return (
    <div className="min-h-screen ">

      <section>
        <div className="text-center my-5">
          <HomeSlider />
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
            Africa is our home it is mystic; it is wild; it is a sweltering inferno; it is a photographer’s paradise, a hunter’s Valhalla, an escapist’s Utopia. It is what you will, and it withstands all interpretations. It is the last vestige of a dead world or the cradle of a shiny new one. To a lot of people, as to myself, it is just home.”WELCOME TO THE LAND OF JOURNEYS!
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

      <section className="mx-5">
        <AfricaWildlifeHero />
      </section>

      <section className="mx-5">
        <WildlifeDestinations />
      </section>


    </div>
  );
}
