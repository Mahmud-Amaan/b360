import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "B360 - Global Customer Support & Digital Operations",
  description:
    "Expert customer support coverage with strategic hubs across four continents. Scale your CX operations with B360's global 24/7 services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-inter antialiased`}
      >
        <Providers>{children}</Providers>
        <script src="http://localhost:3000/chatbot-dev.js" data-chatbot-id="94bdfa37-bcb2-4988-80c3-ae5675010610" defer></script>
      </body>
    </html>
  );
}
