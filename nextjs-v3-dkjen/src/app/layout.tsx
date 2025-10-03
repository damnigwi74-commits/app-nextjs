import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingBar from "@/components/LoadingBar";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "Touring Company",
  description: "Discover the best tours with us!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body className="pt-40">
        {/* Navbar placeholder */}
        <Navbar />

        {/* Global Loading Bar */}
        <LoadingBar />

        <main className="pt-6">{children}</main>

          {/* Global Loading Bar */}
          <Footer />
      </body>
    </html>
    </ClerkProvider>
  );
}
/*
 <html lang="en">
      <body className="pt-30">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
*/