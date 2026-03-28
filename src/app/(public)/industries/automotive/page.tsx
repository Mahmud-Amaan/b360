"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Car,
  CalendarCheck,
  Wrench,
  Users,
  Tags,
  PhoneForwarded,
} from "lucide-react";

export default function AutomotivePage() {
  const features = [
    {
      title: "Test Drive Booking",
      description:
        "Automatically qualify leads over the phone or chat and seamlessly schedule test drives directly into your CRM.",
      icon: <Car className="w-12 h-12" />,
    },
    {
      title: "Service Scheduling",
      description:
        "Let AI handle the massive volume of routine oil change and maintenance appointment calls for your service bay.",
      icon: <Wrench className="w-12 h-12" />,
    },
    {
      title: "Inventory & Pricing FAQs",
      description:
        "Instantly answer customer questions regarding specific vehicle availability, trim packages, and current promotions.",
      icon: <Tags className="w-12 h-12" />,
    },
    {
      title: "After-Hours Lead Capture",
      description:
        "Never miss a highly-motivated buyer looking for a car at 9 PM on a Sunday. Capture their info and alert sales.",
      icon: <Users className="w-12 h-12" />,
    },
    {
      title: "Service Reminders & Follow-Ups",
      description:
        "Proactively trigger outbound voice calls to remind past customers that their scheduled maintenance is due.",
      icon: <CalendarCheck className="w-12 h-12" />,
    },
    {
      title: "Smart Call Routing",
      description:
        "Intelligently route complex calls directly to specific salespeople or master technicians when human help is needed.",
      icon: <PhoneForwarded className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Maximized Service Bay",
      description:
        "Keep your service technicians busy with full schedules thanks to automated booking and reminders.",
      metric: "100% Utilization",
    },
    {
      title: "Boosted Sales Pipeline",
      description:
        "Capture every inbound lead and instantly pass qualified, hot prospects directly to your sales floor.",
      metric: "+35% Lead Capture",
    },
    {
      title: "Zero Missed Calls",
      description:
        "Service drive is too loud? Salesmen busy? The AI picks up the phone on the very first ring, every single time.",
      metric: "Immediate Answer",
    },
    {
      title: "Higher Customer Retention",
      description:
        "Proactive recall notifications and service follow-ups build trust and ensure customers return to your dealership.",
      metric: "Increased Loyalty",
    },
  ];

  const stats = [
    { value: "0", label: "Missed Calls" },
    { value: "+35%", label: "Lead Capture Rate" },
    { value: "24/7", label: "Service Booking" },
    { value: "100%", label: "Service Utilization" },
  ];

  const testimonial = {
    quote:
      "Our BDC (Business Development Center) couldn't keep up with the volume of service calls on Monday mornings. Integrating B360's voice agent removed that bottleneck entirely. Plus, it books test drives while our sales team is asleep. Incredible ROI.",
    author: "David L.",
    company: "Summit Ford Dealerships",
  };

  return (
    <PageLayout
      title="Automotive Dealerships & Services AI"
      subtitle="Drive sales and pack your service bays with intelligent voice automation"
      description="Deploy cutting-edge AI call agents to instantly book test drives, handle high-volume service appointments, and follow up with leads, ensuring your staff never misses an opportunity."
      heroGradient="from-slate-100 to-gray-200"
      ctaTitle="Ready to accelerate your dealership's growth?"
      ctaDescription="Deploy a B360 AI voice agent to handle the phones so your sales team can focus on closing deals on the floor."
    >
      <ContentSection
        title="Complete Automotive Automation"
        description="Tailored specifically for car dealerships, auto groups, and independent service centers."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Dealership Impact"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
