"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Hotel,
  BellRing,
  Bed,
  PhoneCall,
  Utensils,
  HeadphonesIcon,
} from "lucide-react";

export default function HotelsPage() {
  const features = [
    {
      title: "Reservation & Booking Handling",
      description:
        "AI agents process reservations directly over the phone and via website chat, managing availability in real-time.",
      icon: <Bed className="w-12 h-12" />,
    },
    {
      title: "24/7 Virtual Concierge",
      description:
        "Provide instant recommendations for local restaurants, transportation, and events to guests at any hour.",
      icon: <BellRing className="w-12 h-12" />,
    },
    {
      title: "Room Service & Amenities",
      description:
        "Guests can order room service, request fresh towels, or ask for a late check-out entirely through voice or text.",
      icon: <Utensils className="w-12 h-12" />,
    },
    {
      title: "Front Desk Offloading",
      description:
        "AI instantly answers peak-time phone calls so your front desk staff can focus entirely on checking in live guests.",
      icon: <HeadphonesIcon className="w-12 h-12" />,
    },
    {
      title: "FAQ & Policy Automation",
      description:
        "Seamlessly answer repetitive questions about check-in times, pool hours, parking policies, and pet rules.",
      icon: <Hotel className="w-12 h-12" />,
    },
    {
      title: "Automated Upselling",
      description:
        "Intelligently offer room upgrades, spa packages, or late check-out options when guests interact with the AI.",
      icon: <PhoneCall className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Front Desk Relief",
      description:
        "Significantly reduce the call volume hitting your front desk, allowing staff to focus on hospitality.",
      metric: "70% Fewer Calls",
    },
    {
      title: "Increased Bookings",
      description:
        "Never miss a potential reservation just because the front desk was busy assisting another guest.",
      metric: "20% More Direct",
    },
    {
      title: "Guest Satisfaction",
      description:
        "Instant answers to requests, room service, and FAQs without waiting on hold.",
      metric: "5-Star Ratings",
    },
    {
      title: "Ancillary Revenue",
      description:
        "Consistent and friendly AI upselling of amenities, dining, and premium room tiers.",
      metric: "+15% Revenue",
    },
  ];

  const stats = [
    { value: "70%", label: "Calls Handled" },
    { value: "24/7", label: "Concierge Availability" },
    { value: "+15%", label: "Upsell Revenue" },
    { value: "5-Star", label: "Guest Satisfaction" },
  ];

  const testimonial = {
    quote:
      "Before B360, our front desk struggled during the 3 PM check-in rush because the phones wouldn't stop ringing. Now, the AI voice agent handles all the FAQs, and our team gives 100% of their attention to the guests standing in front of them.",
    author: "Marcus Vance",
    company: "Oceanview Resort & Spa",
  };

  return (
    <PageLayout
      title="Hotels & Hospitality AI Agents"
      subtitle="Elevate the guest experience with 24/7 AI voice and chat assistants"
      description="Automate reservations, provide instant concierge services, and eliminate hold times for your guests while boosting your hotel's operational efficiency."
      heroGradient="from-amber-50 to-orange-50"
      ctaTitle="Ready to upgrade your hotel's guest experience?"
      ctaDescription="Deploy specialized AI voice agents and chatbotss designed to handle high-volume hospitality inquiries flawlessly."
    >
      <ContentSection
        title="Comprehensive Hospitality Solutions"
        description="Our AI agents are specifically trained for the hospitality industry to handle high volumes of reservations and guest service requests."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Hospitality Impact"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
