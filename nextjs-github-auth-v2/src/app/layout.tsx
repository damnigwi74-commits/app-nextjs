import "./globals.css";

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
    <html lang="en">
      <body className="pt-1">
       
        <main className="min-h-screen">{children}</main>

      </body>
    </html>
  );
}
