import React from 'react';
import destinations from '@/data/destinations.json';
import DestinationCardItem from './WildlifeDestinationItem';

const WildlifeDestinations2 = () => {
  return (
    <div>
      <div className="w-full bg-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Grid of Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.destinations.map((destination) => (
              <DestinationCardItem
                key={destination.id}
                id={destination.id}
                title={destination.title}
                description={destination.description}
                imageUrl={destination.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const WildlifeDestinations = () => {
  // Max items = 2 rows worth of items (lg:grid-cols-4 => 8 max)
  const maxItems = 8;
  const visibleDestinations = destinations.destinations.slice(0, maxItems);

  return (
    <div>
      <div className="w-full bg-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Grid of Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleDestinations.map((destination) => (
              <DestinationCardItem
                key={destination.id}
                id={destination.id}
                title={destination.title}
                description={destination.description}
                imageUrl={destination.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WildlifeDestinations;