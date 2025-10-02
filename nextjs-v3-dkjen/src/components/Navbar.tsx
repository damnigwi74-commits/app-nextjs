"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/clerk-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

  return (
    <header className="w-full fixed top-0 z-50 shadow-md">
      {/* Top Green Bar */}
      <div className="bg-green-900 text-white px-4 py-2">
        <div className="flex items-center justify-between pt-2 mx-4 ">
          {/* Logo (image + text) */}
          <Link href="/" className="flex items-center gap-2">
             <Image src="/logo.svg" alt="Logo" width={50} height={50} />
            <span className="text-lg font-bold">African Jungles</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Socials */}
            <div className="flex gap-3">
              <Facebook size={18} className="cursor-pointer hover:text-gray-300" />
              <Instagram size={18} className="cursor-pointer hover:text-gray-300" />
              <Twitter size={18} className="cursor-pointer hover:text-gray-300" />
              <Youtube size={18} className="cursor-pointer hover:text-gray-300" />
            </div>

            {/* Hamburger (mobile only) */}
            <button
              className="md:hidden ml-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Contact info (always visible, layout changes on mobile) */}
        <div className="flex flex-col md:flex-row md:justify-end md:gap-6 text-sm mt-2 md:mt-0 text-center md:text-right">
          <span className="flex items-center justify-center md:justify-start gap-1">
            <Phone size={14} /> +254 722 423 770
          </span>
          <span className="flex items-center justify-center md:justify-start gap-1">
            <Mail size={14} /> info@africanjungles.co.ke
          </span>

          <span className="flex items-center justify-center md:justify-start gap-1">
            <SignedIn>
              <UserButton/>
            </SignedIn>

            <SignedOut>
              <Link href="/sign-in" className="hover:underline">
                Sign In
              </Link>
            </SignedOut>
          </span>

        </div>
      </div>

      {/* White navbar (desktop only) */}
      <nav className="bg-white hidden md:block">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
          <div className="flex space-x-6 font-medium">
            <Link href="/" className="hover:text-green-700">
              Home
            </Link>
            <Link href="/tours" className="hover:text-green-700">
              Safaris & Tours
            </Link>
            <Link href="/packages" className="hover:text-green-700">
              Package List
            </Link>
            <Link href="/destinations" className="hover:text-green-700">
              Top Destinations
            </Link>
            <Link href="/parks" className="hover:text-green-700">
              National Parks
            </Link>
            <Link href="/hotels" className="hover:text-green-700">
              Hotels & Lodges
            </Link>
            <Link href="/experiences" className="hover:text-green-700">
              Experiences
            </Link>
            <Link href="/about" className="hover:text-green-700">
              About Us
            </Link>

            <Link href="/learning" className="hover:text-green-700">
              Learning
            </Link>

          </div>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 py-4 space-y-3 shadow-lg">
          <Link href="/" onClick={handleClose} className="block hover:text-green-700">
            Home
          </Link>
          <Link href="/tours" onClick={handleClose} className="block hover:text-green-700">
            Safaris & Tours
          </Link>
          <Link href="/packages" onClick={handleClose} className="block hover:text-green-700">
            Package List
          </Link>
          <Link href="/destinations" onClick={handleClose} className="block hover:text-green-700">
            Top Destinations
          </Link>
          <Link href="/parks" onClick={handleClose} className="block hover:text-green-700">
            National Parks
          </Link>
          <Link href="/accommodation" onClick={handleClose} className="block hover:text-green-700">
            Hotels & Lodges
          </Link>
          <Link href="/experiences" onClick={handleClose} className="block hover:text-green-700">
            Experiences
          </Link>
          <Link href="/about" onClick={handleClose} className="block hover:text-green-700">
            About Us
          </Link>
        </div>
      )}
    </header>
  );
}




// "use client";
// import Link from "next/link";

// export default function Navbar() {
//   return (
//     <nav className="bg-white shadow-md fixed w-full top-0 z-50">
//       <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
//         <h1 className="text-2xl font-bold text-blue-600">Touring Co.</h1>
//         <div className="space-x-6">
//           <Link href="/" className="hover:text-blue-600">Home</Link>
//           <Link href="/about" className="hover:text-blue-600">About Us</Link>
//           <Link href="/contact" className="hover:text-blue-600">Contact</Link>
//           <Link href="/gallay" className="hover:text-blue-600">Gallay</Link>
//         </div>
//       </div>
//     </nav>
//   );
// }
