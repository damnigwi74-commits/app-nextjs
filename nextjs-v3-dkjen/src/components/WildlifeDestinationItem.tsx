import React from 'react';

interface DestinationCardItemProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

const DestinationCardItem: React.FC<DestinationCardItemProps> = ({
  id,
  title,
  description,
  imageUrl,
}) => {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg group cursor-pointer border-4 border-gray-300">
      {/* Image */}
      <div className="relative h-64 w-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-30 transition-opacity duration-300 group-hover:opacity-40"></div>
        
        {/* Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h3 className="text-white text-2xl md:text-3xl font-bold text-center px-4 drop-shadow-lg">
            {title}
          </h3>
        </div>
      </div>

      {/* Description on Hover */}
      <div className="absolute inset-0 group-hover:bg-opacity-75 transition-all duration-300 flex items-end opacity-0 group-hover:opacity-100">

        <p className="text-white text-sm md:text-base p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {description}
        </p>

      </div>
    </div>
  );
};

export default DestinationCardItem;