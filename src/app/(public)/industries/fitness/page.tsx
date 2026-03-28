"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Activity,
  CalendarCheck,
  TrendingUp,
  PhoneCall,
  Dumbbell,
  Users,
} from "lucide-react";

export default function FitnessPage() {
  const features = [
    {
      title: "Membership Sales Calls",
      description:
        "Proactively follow up with trial members or inbound leads via automated voice calls to drive membership sales.",
      icon: <TrendingUp className="w-12 h-12" />,
    },
    {
      title: "Class Booking & Cancellation",
      description:
        "Let members easily book, modify, or cancel their spot in spin or yoga classes through instant conversational AI.",
      icon: <CalendarCheck className="w-12 h-12" />,
    },
    {
      title: "Lead Nurturing",
      description:
        "Engage website visitors with an AI chatbots that answers questions about facilities, hours, and pricing instantly.",
      icon: <Users className="w-12 h-12" />,
    },
    {
      title: "Automated Reminder Calls",
      description:
        "Reduce no-shows for personal training sessions by sending friendly, automated reminder calls the day before.",
      icon: <PhoneCall className="w-12 h-12" />,
    },
    {
      title: "Facility FAQs",
      description:
        "Eliminate front-desk distractions by letting AI answer questions about pool hours, towel services, and childcare.",
      icon: <Activity className="w-12 h-12" />,
    },
    {
      title: "Trainer Scheduling",
      description:
        "Seamlessly match members with available personal trainers based on fitness goals and schedule availability.",
      icon: <Dumbbell className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Higher Membership Sales",
      description:
        "By following up with every single trial lead rapidly, the AI voice agent significantly boosts conversion rates.",
      metric: "+25% Conversions",
    },
    {
      title: "Front Desk Relief",
      description:
        "Keep your welcome staff focused on greeting members with a smile rather than answering the phone.",
      metric: "Zero Phone Distractions",
    },
    {
      title: "Full Classes",
      description:
        "Easy booking and cancellations mean fewer empty bikes in cycling class and higher utilization of your instructors.",
      metric: "95% Class Fill Rate",
    },
    {
      title: "Personalized Support",
      description:
        "Members get detailed answers about specific equipment or policies exactly when they need them.",
      metric: "Instant Answers",
    },
  ];

  const stats = [
    { value: "+25%", label: "Membership Sales" },
    { value: "0", label: "Missed Waitlist Spots" },
    { value: "95%", label: "Class Utilization" },
    { value: "24/7", label: "Lead Nurturing" },
  ];

  const testimonial = {
    quote:
      "Our personal trainers hated doing cold follow-up calls to people who took a free pass. Now, B360's voice AI handles all the lead nurturing and simply books the sales consultations onto our calendars. Our close rate has never been higher.",
    author: "Jessica M., Owner",
    company: "Iron Core Fitness Studio",
  };

  return (
    <PageLayout
      title="Fitness & Gym AI Automation"
      subtitle="Drive memberships and fill classes with intelligent voice and chat agents"
      description="Deploy conversational AI to handle class bookings, answer facility FAQs, and proactively follow up with leads to grow your gym's revenue while keeping the front desk smiling."
      heroGradient="from-lime-50 to-green-50"
      ctaTitle="Ready to boost your gym's memberships?"
      ctaDescription="Let our AI voice agents handle the lead nurturing and class bookings so your trainers can focus on getting people results."
    >
      <ContentSection
        title="Complete Fitness Lead Automation"
        description="Specifically built to help gyms, yoga studios, and personal training facilities maximize their revenue."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact on Gym Operations"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
