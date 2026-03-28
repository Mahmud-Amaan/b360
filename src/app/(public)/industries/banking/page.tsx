"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Landmark,
  ShieldAlert,
  CreditCard,
  UserPlus,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function BankingPage() {
  const features = [
    {
      title: "Account & Balance Inquiries",
      description:
        "Securely authenticate customers and provide instant answers to balance inquiries, transaction history, and routing numbers.",
      icon: <Landmark className="w-12 h-12" />,
    },
    {
      title: "Fraud Alerts & Verification",
      description:
        "Proactively trigger voice calls to verify suspicious transactions with customers in real-time, preventing financial loss.",
      icon: <ShieldAlert className="w-12 h-12" />,
    },
    {
      title: "Loan Pre-Qualification",
      description:
        "Walk prospective borrowers through an AI-led conversation to pre-qualify them for mortgages, auto loans, or personal lines of credit.",
      icon: <TrendingUp className="w-12 h-12" />,
    },
    {
      title: "Customer Onboarding",
      description:
        "Guide new clients through the account setup process, application status checks, and required KYC document submission.",
      icon: <UserPlus className="w-12 h-12" />,
    },
    {
      title: "Card Management",
      description:
        "Allow users to report lost or stolen credit cards, request limit increases, or unfreeze accounts via secure voice automation.",
      icon: <CreditCard className="w-12 h-12" />,
    },
    {
      title: "Branch & ATM FAQs",
      description:
        "Quickly resolve common questions about local branch hours, ATM locations, and wire transfer policies.",
      icon: <HelpCircle className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Enterprise Security",
      description:
        "Banking-grade security infrastructure ensures all financial data and PII remains strictly confidential.",
      metric: "SOC2 Compliant",
    },
    {
      title: "Reduced Call Volume",
      description:
        "Deflect high-volume, repetitive inquiries (like balance checks) away from expensive human agents.",
      metric: "50% Deflection",
    },
    {
      title: "Instant Fraud Response",
      description:
        "Automated outbound calls reach customers instantly when fraud is suspected, stopping unauthorized charges.",
      metric: "<1 Min Response",
    },
    {
      title: "Increased Loan Leads",
      description:
        "24/7 conversional pre-qualification captures more loan prospects when they are highly motivated.",
      metric: "+30% Leads",
    },
  ];

  const stats = [
    { value: "50%", label: "Call Deflection" },
    { value: "SOC2", label: "Security Compliant" },
    { value: "+30%", label: "Qualified Leads" },
    { value: "24/7", label: "Account Support" },
  ];

  const testimonial = {
    quote:
      "Security and reliability were our primary concerns when adopting AI. B360's voice agents not only met our stringent compliance standards, but they completely transformed our call center. Our human agents now only handle complex financial advising, while the AI manages everything else.",
    author: "Robert Chen, VP of Operations",
    company: "First Capital Credit Union",
  };

  return (
    <PageLayout
      title="Banking & Financial Services AI"
      subtitle="Secure, compliant, and intelligent voice automation for modern finance"
      description="Deploy enterprise-grade AI call agents to handle account inquiries, process loan pre-qualifications, and trigger instant fraud verification calls securely."
      heroGradient="from-slate-50 to-blue-50"
      ctaTitle="Ready to modernize your banking experience?"
      ctaDescription="Let our secure AI voice agents handle the routine inquiries so your financial advisors can focus on high-value client relationships."
    >
      <ContentSection
        title="Next-Generation Finance Solutions"
        description="Built specifically for the high-trust, strictly regulated financial sector."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact & Security"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
