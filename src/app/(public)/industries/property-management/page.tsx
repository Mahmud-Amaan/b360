"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Building2,
  Wrench,
  MessageSquareWarning,
  CalendarClock,
  Key,
  CreditCard,
} from "lucide-react";

export default function PropertyManagementPage() {
  const features = [
    {
      title: "Maintenance Scheduling",
      description:
        "Tenants can submit urgent maintenance requests 24/7. AI categorizes the urgency and dispatches the right vendor immediately.",
      icon: <Wrench className="w-12 h-12" />,
    },
    {
      title: "Rent Reminders & Collections",
      description:
        "Proactively trigger polite, automated outbound phone calls or SMS reminders for late rent payments.",
      icon: <CreditCard className="w-12 h-12" />,
    },
    {
      title: "Complaint Handling",
      description:
        "Intelligently log, route, and de-escalate noise complaints or facility issues before they require manager intervention.",
      icon: <MessageSquareWarning className="w-12 h-12" />,
    },
    {
      title: "Leasing Inquiries",
      description:
        "Answer questions about available units, pricing, pet policies, and amenities for prospective renters instantly.",
      icon: <Key className="w-12 h-12" />,
    },
    {
      title: "Property Tour Booking",
      description:
        "Allow interested prospects to schedule an in-person or virtual tour with your leasing agents over the phone.",
      icon: <CalendarClock className="w-12 h-12" />,
    },
    {
      title: "Multi-Property Support",
      description:
        "Manage calls for dozens of different buildings and HOAs from a single, infinitely scalable AI receptionist.",
      icon: <Building2 className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "24/7 Emergency Triage",
      description:
        "A burst pipe at 3 AM gets routed to your emergency plumber immediately, preventing thousands in property damage.",
      metric: "Instant Dispatch",
    },
    {
      title: "Reduced Admin Overhead",
      description:
        "Property managers stop wasting time answering basic lease questions and can focus on property value and retention.",
      metric: "30+ Hrs/Week Saved",
    },
    {
      title: "Improved Cash Flow",
      description:
        "Automated rent reminders decrease late payments significantly without requiring an awkward phone call from staff.",
      metric: "-40% Late Rent",
    },
    {
      title: "Higher Occupancy",
      description:
        "Capturing leads after-hours and booking tours automatically means fewer vacant units.",
      metric: "98% Occupancy",
    },
  ];

  const stats = [
    { value: "0", label: "Missed Emergencies" },
    { value: "-40%", label: "Late Payments" },
    { value: "30 hrs", label: "Saved per Manager" },
    { value: "24/7", label: "Tenant Support" },
  ];

  const testimonial = {
    quote:
      "Managing 500 units meant our property managers were glorified phone operators, dealing with lockout calls and rent questions all day. We put B360's voice agents on the front line. It handles 80% of tenant interactions and routes the actual emergencies perfectly. It's fully revolutionized our operations.",
    author: "David G., VP of Operations",
    company: "Metro Property Group",
  };

  return (
    <PageLayout
      title="Property Management AI Automation"
      subtitle="Automate maintenance triage, rent collection, and tenant support"
      description="Deploy an intelligent 24/7 AI receptionist to handle the flood of tenant calls, coordinate emergency vendors, and process leasing inquiries so your property managers can focus on growth."
      heroGradient="from-teal-50 to-emerald-50"
      ctaTitle="Ready to scale your property portfolio?"
      ctaDescription="Let our AI voice agents handle the noise and maintenance headaches so your team can focus on acquiring and optimizing properties."
    >
      <ContentSection
        title="Complete Property Management Support"
        description="Specifically engineered for residential/commercial property managers and HOA administrators."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact & Efficiency"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
