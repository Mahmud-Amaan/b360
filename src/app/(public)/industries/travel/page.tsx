"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Plane,
  Map,
  FileQuestion,
  CalendarX2,
  HeadsetIcon,
  Globe2,
} from "lucide-react";

export default function TravelPage() {
  const features = [
    {
      title: "Trip Planning Assistance",
      description:
        "Provide inspiring, personalized travel suggestions and itinerary building through natural, conversational AI.",
      icon: <Map className="w-12 h-12" />,
    },
    {
      title: "Flight & Hotel Booking",
      description:
        "Automate the search and booking process for flights, accommodations, and rental cars seamlessly via chat or voice.",
      icon: <Plane className="w-12 h-12" />,
    },
    {
      title: "Visa & Requirements FAQs",
      description:
        "Instantly answer complex questions regarding passport validity, visa requirements, and travel advisories.",
      icon: <FileQuestion className="w-12 h-12" />,
    },
    {
      title: "Cancellations & Modifications",
      description:
        "Handle stressful, high-volume rebookings and cancellations automatically during major weather events or disruptions.",
      icon: <CalendarX2 className="w-12 h-12" />,
    },
    {
      title: "24/7 Traveler Support",
      description:
        "Provide stranded travelers with immediate assistance, regardless of the time zone they are stuck in.",
      icon: <HeadsetIcon className="w-12 h-12" />,
    },
    {
      title: "Multi-Language Capabilities",
      description:
        "Communicate clearly with international tourists in their native language to ensure a flawless experience.",
      icon: <Globe2 className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Crisis Resilience",
      description:
        "When flights are grounded globally, AI agents instantly absorb the massive spike in customer service calls.",
      metric: "Infinite Scalability",
    },
    {
      title: "Global Support",
      description:
        "Support your travelers anywhere in the world, at any time of day, without running costly overnight call centers.",
      metric: "24/7/365",
    },
    {
      title: "Increased Conversion",
      description:
        "Suggesting popular destinations and answering hesitations instantly drives higher booking conversion rates.",
      metric: "+18% Bookings",
    },
    {
      title: "Reduced Frustration",
      description:
        "No more putting stressed travelers on hold for 2 hours. AI picks up immediately and solves the problem.",
      metric: "Zero Hold Time",
    },
  ];

  const stats = [
    { value: "Infinite", label: "Call Scalability" },
    { value: "24/7", label: "Global Coverage" },
    { value: "+18%", label: "Booking Conversion" },
    { value: "0 Min", label: "Hold Times" },
  ];

  const testimonial = {
    quote:
      "When a severe storm grounded hundreds of flights last winter, our small agency was devastated by the call volume. We deployed B360 shortly after. Now, their AI voice agents handle cancellations and rebookings automatically. It's the ultimate safety net.",
    author: "Samantha K.",
    company: "Wanderlust Travel Group",
  };

  return (
    <PageLayout
      title="Travel & Tourism AI Agents"
      subtitle="Providing seamless, infinite-scale support for global travelers"
      description="Deploy multilingual AI chatbotss and voice agents to help users plan trips, book flights, and handle high-stress cancellations instantly—anywhere, anytime."
      heroGradient="from-cyan-50 to-blue-50"
      ctaTitle="Ready to future-proof your travel agency?"
      ctaDescription="Let our intelligent AI handle the heavy lifting of customer support, so your agents can focus on crafting dream vacations."
    >
      <ContentSection
        title="Complete Travel Automation"
        description="Built to handle the immense scale and rapid fluctuations of the global travel industry."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Agency Impact"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
