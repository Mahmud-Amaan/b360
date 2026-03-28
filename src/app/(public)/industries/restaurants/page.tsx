"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Utensils,
  Phone,
  Clock,
  Store,
  MapPin,
  CalendarDays,
} from "lucide-react";

export default function RestaurantsPage() {
  const features = [
    {
      title: "Phone Order Automation",
      description:
        "AI voice agents handle takeout and delivery phone orders, seamlessly integrating with your POS system.",
      icon: <Phone className="w-12 h-12" />,
    },
    {
      title: "Table Reservations",
      description:
        "Automatically process, schedule, and confirm dining reservations 24/7 without staff intervention.",
      icon: <CalendarDays className="w-12 h-12" />,
    },
    {
      title: "Menu Inquiries & Details",
      description:
        "Instantly answer questions regarding dietary restrictions, daily specials, ingredients, and pricing.",
      icon: <Utensils className="w-12 h-12" />,
    },
    {
      title: "Delivery Tracking & Support",
      description:
        "Provide customers with real-time updates on their food delivery status and resolve missing item complaints.",
      icon: <MapPin className="w-12 h-12" />,
    },
    {
      title: "Hours & Location FAQs",
      description:
        "Eliminate repetitive calls asking for directions, parking information, and holiday hours.",
      icon: <Clock className="w-12 h-12" />,
    },
    {
      title: "Multi-Location Support",
      description:
        "Scale your AI voice agent across franchises to ensure consistent customer service at every single location.",
      icon: <Store className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Zero Missed Orders",
      description:
        "Never let the phone ring out during a Friday night dinner rush. Capture every single takeout order.",
      metric: "100% Answer Rate",
    },
    {
      title: "Staff Focus",
      description:
        "Allow your hosts and waitstaff to focus on the diners in the restaurant rather than answering the phone.",
      metric: "Enhanced Dining",
    },
    {
      title: "Accurate Ordering",
      description:
        "Natural language processing accurately captures complex orders, substitutions, and allergies.",
      metric: "99% Accuracy",
    },
    {
      title: "Increased Revenue",
      description:
        "AI automatically suggests appetizers, drinks, and desserts, driving up the average ticket size.",
      metric: "+20% Ticket Size",
    },
  ];

  const stats = [
    { value: "0", label: "Missed Calls" },
    { value: "99%", label: "Order Accuracy" },
    { value: "+20%", label: "Avg Ticket Size" },
    { value: "24/7", label: "Reservation Booking" },
  ];

  const testimonial = {
    quote:
      "Friday nights used to be chaotic with the phone ringing off the hook while a line went out the door. Now, our B360 AI voice agent takes every takeout order and reservation perfectly. It's like having the world's best host working for pennies.",
    author: "Chef Tony R.",
    company: "Tony's Pizzeria & Trattoria",
  };

  return (
    <PageLayout
      title="Restaurants & Food Delivery AI"
      subtitle="Automate takeout orders and reservations so your staff can focus on the food"
      description="Deploy intelligent voice agents to answer every call, process complex food orders, handle reservations, and answer menu FAQs during your busiest rushes."
      heroGradient="from-orange-50 to-red-50"
      ctaTitle="Ready to eliminate missed phone orders?"
      ctaDescription="Let our AI voice agents handle the noise so you can handle the cooking. Start capturing every order today."
    >
      <ContentSection
        title="Complete Restaurant Automation"
        description="Designed specifically for the fast-paced food industry to handle complex orders and high call volumes flawlessly."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact on Your Bottom Line"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
