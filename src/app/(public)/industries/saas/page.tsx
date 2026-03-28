"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Code2,
  HeadsetIcon,
  Lightbulb,
  PhoneForwarded,
  Target,
  Wrench,
} from "lucide-react";

export default function SaaSPage() {
  const features = [
    {
      title: "Technical Troubleshooting",
      description:
        "AI agents diagnose common API errors, configuration issues, and software bugs by querying your technical documentation.",
      icon: <Wrench className="w-12 h-12" />,
    },
    {
      title: "Sales Qualification (BDR)",
      description:
        "Act as an automated Business Development Rep to call inbound leads instantly, qualify them, and book demos.",
      icon: <Target className="w-12 h-12" />,
    },
    {
      title: "Onboarding Guidance",
      description:
        "Provide proactive outreach to new users, guiding them through activation steps to prevent early churn.",
      icon: <Lightbulb className="w-12 h-12" />,
    },
    {
      title: "AI Customer Support Bots",
      description:
        "Deploy advanced chat chatbots inside your web app that can securely interact with user data to resolve tier-1 tickets.",
      icon: <HeadsetIcon className="w-12 h-12" />,
    },
    {
      title: "Developer API Support",
      description:
        "Assist developers integrating your platform by instantly surfacing relevant endpoints and code snippets from your docs.",
      icon: <Code2 className="w-12 h-12" />,
    },
    {
      title: "Intelligent Escalation",
      description:
        "When an issue is too complex, the AI seamlessly routes the call or chat to the appropriate specialized engineering team.",
      icon: <PhoneForwarded className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Scaled Tech Support",
      description:
        "Resolve 70%+ of tier-1 support tickets automatically, massively reducing your support team's backlog.",
      metric: "70% Deflection",
    },
    {
      title: "Higher Demo Conversion",
      description:
        "Calling a SaaS lead within 5 minutes increases conversion exponentially. AI does it in 5 seconds.",
      metric: "3x More Demos",
    },
    {
      title: "Reduced Churn",
      description:
        "Proactive onboarding and instant support ensure users reach the 'aha moment' faster and stick around.",
      metric: "-15% Churn",
    },
    {
      title: "Lower Support Costs",
      description:
        "Extend coverage globally 24/7 without needing to hire a massive follow-the-sun support team.",
      metric: "Global Scale",
    },
  ];

  const stats = [
    { value: "70%", label: "Ticket Deflection" },
    { value: "3x", label: "Demo Bookings" },
    { value: "-15%", label: "Early Churn" },
    { value: "24/7", label: "Developer Support" },
  ];

  const testimonial = {
    quote:
      "As a fast-growing SaaS startup, our engineering team was wasting half their week answering basic API integration questions. We trained B360's AI on our docs. The deflection rate is incredible, and our engineers finally have time to ship new features.",
    author: "Alex W., CTO",
    company: "CloudSync Infrastructure",
  };

  return (
    <PageLayout
      title="SaaS & Tech Companies AI"
      subtitle="Deflect tier-1 tickets and automate BDR outreach at scale"
      description="Deploy highly technical AI voice agents and chatbotss that integrate deeply with your documentation to resolve user bugs, guide onboarding, and qualify inbound leads instantly."
      heroGradient="from-violet-50 to-fuchsia-50"
      ctaTitle="Ready to scale your tech startup gracefully?"
      ctaDescription="Stop drowning in tier-1 support tickets. Let our AI agents handle the noise so your engineers can go back to building."
    >
      <ContentSection
        title="Intelligent Software Automation"
        description="Engineered for B2B SaaS, developer tools, and fast-growing technology companies."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact on Engineering & Sales"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
