import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

export const metadata: Metadata = {
  title: "Ultimo Capelli - Premium Hair Restoration",
  description: "At Ultimo Capelli, we specialize in premium non-surgical hair replacement solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col antialiased font-body-md">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
