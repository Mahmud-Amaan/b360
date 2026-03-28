"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/public/landing";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { Footer } from "./Footer";

interface PageLayoutProps {
  title: string;
  subtitle: string;
  description?: string;
  heroGradient?: string;
  children: ReactNode;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonHref?: string;
  secondaryCtaButtonText?: string;
  secondaryCtaHref?: string;
}

export function PageLayout({
  title,
  subtitle,
  description,
  heroGradient = "from-blue-50 to-slate-50",
  children,
  ctaTitle = "Ready to get started?",
  ctaDescription = "Let's discuss how B360 can help you achieve better outcomes.",
  ctaButtonText = "Book a Demo Now",
  ctaButtonHref = "/contact",
  secondaryCtaButtonText,
  secondaryCtaHref,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${heroGradient} pt-44 pb-16`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-heading">
              {title}
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 mb-8 font-medium">
              {subtitle}
            </p>
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                {description}
              </p>
            )}
            <Link href={ctaButtonHref}>
              <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-8 py-3 font-bold text-lg shadow-lg ">
                {ctaButtonText}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16">{children}</main>

      {/* CTA Section */}
      <section className="bg-gradient-navy-blue py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-heading">
              {ctaTitle}
            </h2>
            <p className="text-xl text-white/90 mb-8">{ctaDescription}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={ctaButtonHref}>
                <Button className="bg-white text-blue-600 hover:bg-gray-100 rounded-full px-8 py-3 font-bold text-lg shadow-lg">
                  {ctaButtonText}
                </Button>
              </Link>
              {secondaryCtaButtonText && secondaryCtaHref && (
                <Link href={secondaryCtaHref}>
                  <Button 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full px-8 py-3 font-bold text-lg bg-transparent"
                  >
                    {secondaryCtaButtonText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Floating Contact Button */}
      <Link href="/contact">
        <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-gradient-navy-blue text-white shadow-lg hover:scale-110 transition-transform duration-300 z-50">
          <MessageSquare className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  );
}
