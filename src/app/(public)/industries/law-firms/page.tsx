"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Scale,
  ClipboardList,
  Calendar,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export default function LawFirmsPage() {
  const features = [
    {
      title: "Client Intake Automation",
      description:
        "Seamlessly capture new client details, case types, and urgency levels instantly via 24/7 AI voice and chat agents.",
      icon: <ClipboardList className="w-12 h-12" />,
    },
    {
      title: "Case Qualification",
      description:
        "Intelligently vet inbound leads using pre-defined questions to ensure attorneys only spend time on qualified cases.",
      icon: <Scale className="w-12 h-12" />,
    },
    {
      title: "Appointment Booking",
      description:
        "Automatically schedule initial consultations between qualified prospects and available attorneys.",
      icon: <Calendar className="w-12 h-12" />,
    },
    {
      title: "Non-Legal FAQs",
      description:
        "Easily handle common inquiries regarding office hours, billing procedures, location, and required documentation.",
      icon: <MessageSquare className="w-12 h-12" />,
    },
    {
      title: "Secure & Confidential",
      description:
        "Maintain attorney-client privilege and strict data privacy with our secure AI infrastructure.",
      icon: <ShieldCheck className="w-12 h-12" />,
    },
    {
      title: "After-Hours Answering",
      description:
        "Never miss an emergency call for criminal defense or personal injury cases that come in late at night.",
      icon: <PhoneCall className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Increased Caseload",
      description:
        "Capture every late-night emergency call and convert them into scheduled consultations before competitors do.",
      metric: "+25% Retainers",
    },
    {
      title: "Attorney Time Saved",
      description:
        "Stop wasting billable hours on unqualified leads. AI filters the noise and delivers only viable cases.",
      metric: "15 Hrs/Week",
    },
    {
      title: "Professional Image",
      description:
        "Ensure every single caller receives a polite, articulate, and immediate response, enhancing your firm's reputation.",
      metric: "Zero Hold Time",
    },
    {
      title: "Lower Overhead",
      description:
        "Reduce the need for a massive reception staff or an expensive after-hours answering service.",
      metric: "-40% Costs",
    },
  ];

  const stats = [
    { value: "+25%", label: "More Retainers" },
    { value: "15 hrs", label: "Saved per Attorney" },
    { value: "24/7", label: "Intake Availability" },
    { value: "0", label: "Missed Emergency Calls" },
  ];

  const testimonial = {
    quote:
      "For a personal injury firm, missing a phone call on a weekend means losing a multimillion-dollar case. Since deploying B360's voice agents, we instantly intake emergency cases 24/7. It paid for itself in the first week.",
    author: "Robert T., Managing Partner",
    company: "Tate & Associates Law",
  };

  return (
    <PageLayout
      title="Legal Firms & Attorneys AI"
      subtitle="Automate client intake and case qualification with secure AI agents"
      description="Deploy intelligent voice and chat agents to act as your firm's 24/7 receptionist. Let AI qualify leads and schedule consultations so your attorneys can focus on winning cases."
      heroGradient="from-slate-50 to-gray-200"
      ctaTitle="Ready to capture more qualified legal cases?"
      ctaDescription="Let our secure AI voice agents handle your client intake and eliminate the unqualified leads draining your billable hours."
    >
      <ContentSection
        title="Complete Legal Intake Automation"
        description="Specifically designed for law firms looking to scale their client acquisition without inflating administrative overhead."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Firm Impact & ROI"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
