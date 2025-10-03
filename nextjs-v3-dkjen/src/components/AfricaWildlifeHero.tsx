export default function AfricaWildlifeHero({ 
  title = "Africa Top Wildlife Destinations.",
  mainText = "This continent will take your breath away, from the magnificent landscapes to the warm atmosphere radiating everywhere you go. Full of adventure, prolific birdlife, the big five, and incredible special five in Samburu national reserve, there are many reasons why we think Kenya in Africa is one of the most naturally beautiful countries in the world and deserves the name 'Magical Kenya'",
  subText = "Our Kenya safaris truly offer you a broad taste of everything an African safari has to offer, and you can tailor your experience to suit your desires. This is where wildebeest migration occurs in the heart of Masai Mara game reserve, and also where lion, leopard, cheetah, buffalo, and elephant rove freely in their natural habitat and the greater Chalbi desert. With so many unique habitats, you will find hundreds of different species and our guides guarantee a personalized and tailored travel experience, with everything from 4X4 jeep safaris to the beautiful coastal beaches of Mombasa",
  callToAction = "Check out our tour packages that may inspire your taste"
}) {
  return (
    <div className="w-full bg-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title Section */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-8">
          {title}
        </h1>
        
        {/* Brown Content Box */}
        <div className="bg-amber-900 text-white rounded-lg p-8 md:p-12 shadow-lg">
          {/* Main Text */}
          <p className="text-base md:text-lg leading-relaxed text-center mb-6">
            {mainText}
          </p>
          
          {/* Sub Text */}
          <p className="text-base md:text-lg leading-relaxed text-center mb-12">
            {subText}
          </p>
          
          {/* Call to Action */}
          <p className="text-lg md:text-xl text-center font-medium">
            {callToAction}
          </p>
        </div>
      </div>
    </div>
  );
}