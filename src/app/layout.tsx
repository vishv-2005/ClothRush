import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "VastraNow — Local Fashion. Delivered Fast.",
  description:
    "Discover trendy clothing from local stores near you and get it delivered in 15-20 minutes. Shop shirts, kurtis, dresses, jeans and more from your neighborhood fashion stores.",
  keywords: [
    "fashion",
    "local shopping",
    "quick delivery",
    "clothing",
    "hyperlocal",
    "VastraNow",
  ],
  openGraph: {
    title: "VastraNow — Local Fashion. Delivered Fast.",
    description:
      "Shop from nearby local fashion stores. Get clothes delivered in 15-20 minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
