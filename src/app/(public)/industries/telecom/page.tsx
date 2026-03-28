"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Smartphone,
  Wifi,
  Receipt,
  Wrench,
  HeadsetIcon,
  MessageSquareWarning,
} from "lucide-react";

export default function TelecomPage() {
  const features = [
    {
      title: "Billing & Account Inquiries",
      description:
        "Allow customers to instantly check their current balance, due dates, and data usage over standard phone calls.",
      icon: <Receipt className="w-12 h-12" />,
    },
    {
      title: "Plan Upgrades & Sales",
      description:
        "Intelligently identify upgrade opportunities and allow customers to seamlessly opt into higher-tier data plans.",
      icon: <Smartphone className="w-12 h-12" />,
    },
    {
      title: "Network Troubleshooting",
      description:
        "Run automated diagnostic scripts to help customers reset their routers or troubleshoot mobile connectivity issues.",
      icon: <Wifi className="w-12 h-12" />,
    },
    {
      title: "Service Outage Notifications",
      description:
        "Automatically inform callers if they are in a known outage area, preventing frustration and deflecting support tickets.",
      icon: <MessageSquareWarning className="w-12 h-12" />,
    },
    {
      title: "Device Support & Repair",
      description:
        "Guide users through basic hardware troubleshooting or seamlessly schedule an appointment at an authorized repair center.",
      icon: <Wrench className="w-12 h-12" />,
    },
    {
      title: "Intelligent Call Routing",
      description:
        "Evaluate the customer's sentiment and technical need before routing complex cases to specialized tier-2 human agents.",
      icon: <HeadsetIcon className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Massive Call Deflection",
      description:
        "Telecoms notoriously face massive call volumes. AI deflects the low-hanging fruit (billing, outages) automatically.",
      metric: "60% Deflection",
    },
    {
      title: "Improved CSAT Scores",
      description:
        "Customers despise waiting on hold for simple questions. 24/7 instant AI access drastically improves satisfaction.",
      metric: "+30% CSAT",
    },
    {
      title: "Reduced Average Handle Time",
      description:
        "Because AI collects the issue and authenticates the user before a human takes over, humans solve issues much faster.",
      metric: "-45% AHT",
    },
    {
      title: "Proactive Communication",
      description:
        "Inform customers of widespread outages before they even call, building trust and reducing inbound spikes.",
      metric: "Instant Outrage Alerts",
    },
  ];

  const stats = [
    { value: "60%", label: "Inbound Deflection" },
    { value: "-45%", label: "Average Handle Time" },
    { value: "+30%", label: "CSAT Improvement" },
    { value: "24/7", label: "Diagnostic Support" },
  ];

  const testimonial = {
    quote:
      "A regional fiber cut used to completely overwhelm our call centers for 48 hours straight. With B360's voice agents, the AI instantly recognizes the caller's location, informs them of the cut, and provides an ETA for the fix. Our human agents aren't even stressed during outages anymore.",
    author: "Michelle D., VP Customer Success",
    company: "NextGen Broadband",
  };

  return (
    <PageLayout
      title="Telecommunications AI Automation"
      subtitle="Deflect high-volume billing and technical support calls instantly"
      description="Deploy infinitely scalable AI voice agents to handle thousands of concurrent calls regarding billing, network outages, and device troubleshooting for your ISP or mobile network."
      heroGradient="from-sky-50 to-blue-50"
      ctaTitle="Ready to tame your massive call center volume?"
      ctaDescription="Deploy B360's intelligent voice and chat agents to instantly deflect your high-volume inquiries and dramatically lower your customer support costs."
    >
      <ContentSection
        title="Scalable Telecom Solutions"
        description="Engineered specifically to handle the massive constraints and high call volumes faced by ISPs, mobile carriers, and cable providers."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Call Center Impact"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
