"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import hotelsData from "@/data/hotel.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Globe, Check, X } from "lucide-react";

export default function HotelDetails() {
  const { id } = useParams(); // ✅ get ID from URL

  const [hotel, setHotel] = useState<any>(null);
  const [hotelDummy, setHotelDummy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchHotel() {
      try {
        const res = await fetch(`/api/hotels/${id}`);
        if (!res.ok) throw new Error("Failed to fetch hotel");
        const data = await res.json();
        setHotel(data);
        //
       const found = hotelsData.hotels.find((h) => String(h.id) === "1");
       setHotelDummy(found || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHotel();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!hotel) return <div className="p-8">Hotel not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      {hotel.coverImageUrl && (
        <div className="relative w-full h-[400px]">
          <Image
            src={hotel.coverImageUrl}
            alt={hotel.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl text-white font-bold">{hotel.name}</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Description */}
        {hotel.description && (
          <section>
            <h2 className="text-2xl font-semibold mb-2">About</h2>
            <p className="text-gray-600">{hotel.description}</p>
          </section>
        )}

        {/* Location */}
        {hotel.location && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{hotel.location.address}</p>
              <p className="text-gray-500 text-sm">{hotel.location.city}</p>
            </CardContent>
          </Card>
        )}

        {/* Rooms Array.isArray(hotel.rooms) && */}
        { hotelDummy.rooms.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {hotelDummy.rooms.map((room: any, i: number) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>{room.type}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Bed:</strong> {room.bed_type}</p>
                    <p><strong>Max Occupancy:</strong> {room.max_occupancy} guests</p>
                    <p><strong>Rate:</strong> ${room.sample_rate_usd_per_night} / night</p>
                    <p className="text-sm text-gray-500">{room.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
       

        {/* Facilities */}
        {hotel.facilities?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities.map((f: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                  {f}
                </Badge>
              ))}
            </div>
          </section>
        )}
          

        {/* Dining */}
        {hotel.dining?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Dining Options</h2>
            <ul className="list-disc list-inside text-gray-700">
              {hotel.dining.map((d: string, i: number) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </section>
        )}
      

        {/* Policies */}
        {hotel.policies && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Policies</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(hotel.policies).map(([policy, allowed], i) => (
                <Card key={i}>
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="capitalize">{policy}</span>
                    {allowed ? (
                      <Check className="text-green-600" />
                    ) : (
                      <X className="text-red-500" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {hotel.contact && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {hotel.contact.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" /> {hotel.contact.phone}
                </p>
              )}
              {hotel.contact.website && (
                <>
                  <Separator orientation="vertical" className="hidden sm:block h-6" />
                  <a
                    href={hotel.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" /> Visit Website
                  </a>
                </>
              )}
            </div>
          </section>
        )}

        {/* Note */}
        {/* {hotelsData.note && (
          <p className="text-sm text-gray-500 italic mt-8">{hotelsData.note}</p>
        )} */}
        <p className="text-sm text-gray-500 italic mt-8">{"Sample rates are approximate and were taken from hotel/booking listings; availability and exact pricing change with date/season—always confirm on the hotel's official page or booking provider."}</p>
      </div>
    </div>
  );
  
}


// return (
  //   <div className="container mx-auto px-4 py-8">
  //     <h1 className="text-3xl font-bold mb-4">{hotel.name}</h1>

  //     {hotel.images && hotel.images.length > 0 && (
  //       <Image
  //         src={hotel.images[0].url}
  //         alt={hotel.name}
  //         width={800}
  //         height={500}
  //         className="rounded-xl mb-6"
  //       />
  //     )}

  //     <p className="text-lg mb-4">{hotel.description}</p>

  //     {hotel.contact && (
  //       <>
  //         <h2 className="text-xl font-semibold mb-2">Contact</h2>
  //         {hotel.contact.phone && <p>📞 {hotel.contact.phone}</p>}
  //         {hotel.contact.website && (
  //           <p>
  //             🌐{" "}
  //             <a
  //               href={hotel.contact.website}
  //               className="text-blue-600 underline"
  //               target="_blank"
  //               rel="noopener noreferrer"
  //             >
  //               {hotel.contact.website}
  //             </a>
  //           </p>
  //         )}
  //       </>
  //     )}

  //   </div>
  // );