"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Wrench,
  AlertTriangle,
  Calculator,
  CalendarCheck,
  PhoneCall,
  MessageSquare,
} from "lucide-react";

export default function HomeServicesPage() {
  const features = [
    {
      title: "Automated Job Booking",
      description:
        "AI agents easily schedule service calls, collect customer details, and add jobs directly to your dispatch calendar.",
      icon: <CalendarCheck className="w-12 h-12" />,
    },
    {
      title: "Emergency Request Handling",
      description:
        "Instantly triage burst pipes, broken ACs, or electrical failures and automatically dispatch on-call technicians.",
      icon: <AlertTriangle className="w-12 h-12" />,
    },
    {
      title: "Instant Pricing Estimates",
      description:
        "Provide approximate costs for standard services like drain cleaning or AC tune-ups directly over the phone.",
      icon: <Calculator className="w-12 h-12" />,
    },
    {
      title: "Customer Follow-Ups",
      description:
        "Deploy automated voice calls to ensure the customer was satisfied with the repair and ask for a Google review.",
      icon: <PhoneCall className="w-12 h-12" />,
    },
    {
      title: "Service Area FAQs",
      description:
        "Quickly answer repetitive questions regarding what cities you service, dispatch fees, and warranty policies.",
      icon: <MessageSquare className="w-12 h-12" />,
    },
    {
      title: "Multi-Trade Support",
      description:
        "Whether you do HVAC, plumbing, or electrical, the AI agent dynamically routes calls to the right department.",
      icon: <Wrench className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "No More Missed Jobs",
      description:
        "Every time a customer gets your voicemail, they call the next plumber on Google. AI ensures they always get an answer.",
      metric: "100% Answer Rate",
    },
    {
      title: "Reduced Dispatch Overhead",
      description:
        "Run a leaner office team by letting AI handle the endless stream of basic pricing and scheduling calls.",
      metric: "30% Lower Costs",
    },
    {
      title: "More Reviews",
      description:
        "Automated follow-ups significantly boost your 5-star reviews on Google and Yelp, driving local SEO.",
      metric: "3x More Reviews",
    },
    {
      title: "Technician Efficiency",
      description:
        "Technicians spend less time on the phone doing dispatch work and more time turning wrenches.",
      metric: "Maximized Billable",
    },
  ];

  const stats = [
    { value: "0", label: "Missed Emergency Calls" },
    { value: "100%", label: "Lead Capture" },
    { value: "3x", label: "More Google Reviews" },
    { value: "24/7", label: "Dispatch Availability" },
  ];

  const testimonial = {
    quote:
      "Before B360, our HVAC technicians had to answer calls while working in 120-degree attics. Now, the AI voice agent schedules the standard maintenance calls and instantly texts me if it's a 'no-AC' emergency. We capture way more jobs.",
    author: "Mike D.",
    company: "Desert Breeze HVAC & Plumbing",
  };

  return (
    <PageLayout
      title="Home Services & Trades AI"
      subtitle="Never miss a job call. 24/7 AI dispatchers for HVAC, plumbing, and more."
      description="Deploy intelligent AI voice agents to book jobs, give pricing estimates, and handle after-hours emergencies so your business can dominate the local service market."
      heroGradient="from-yellow-50 to-orange-50"
      ctaTitle="Ready to capture every local service lead?"
      ctaDescription="Stop losing jobs to your competitors' answering services. Let our AI voice agents book your schedule full."
    >
      <ContentSection
        title="Complete Home Services Automation"
        description="Specifically designed for plumbers, electricians, cleaners, roofers, and HVAC companies."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact on Your Trade Business"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
