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
        <script src="https://b360-one.vercel.app/chatbot.js" data-chatbot-id="a1185561-ace5-4917-b6d0-3235591d3f2f" defer></script>
      </body>
    </html>
  );
}
