"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  ShoppingBag,
  Store,
  PackageSearch,
  Tag,
  MessageCircle,
  Clock,
} from "lucide-react";

export default function RetailPage() {
  const features = [
    {
      title: "Product Availability Queries",
      description:
        "Customers can call or chat to instantly check if a specific item or size is in stock at their local store.",
      icon: <ShoppingBag className="w-12 h-12" />,
    },
    {
      title: "Store Hours & Location",
      description:
        "Eliminate the high volume of calls simply asking for holiday hours, directions, and parking details.",
      icon: <Clock className="w-12 h-12" />,
    },
    {
      title: "Hybrid Order Tracking",
      description:
        "Seamlessly answer 'Where is my order?' inquiries for customers who buy online and pick up in-store (BOPIS).",
      icon: <PackageSearch className="w-12 h-12" />,
    },
    {
      title: "Promotions & Sales FAQs",
      description:
        "Let the AI explain current discounts, return policies, and loyalty program benefits during busy holiday seasons.",
      icon: <Tag className="w-12 h-12" />,
    },
    {
      title: "Multi-Store Support",
      description:
        "Deploy a single, consistent AI voice agent that can route calls to specific departments or franchise locations.",
      icon: <Store className="w-12 h-12" />,
    },
    {
      title: "E-Commerce Chat Support",
      description:
        "Equip your online storefront with intelligent chatbotss to reduce cart abandonment and resolve issues instantly.",
      icon: <MessageCircle className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "In-Store Staff Focus",
      description:
        "Keep your floor associates focused on the customers in front of them, rather than running to answer the ringing phone.",
      metric: "Undivided Attention",
    },
    {
      title: "Increased Sales",
      description:
        "Prevent abandoned purchases by instantly confirming product availability before a customer visits.",
      metric: "+15% Foot Traffic",
    },
    {
      title: "Unmatched Consistency",
      description:
        "Every single caller receives the exact same polite, accurate, and brand-aligned greeting and response.",
      metric: "100% Brand Safe",
    },
    {
      title: "Holiday Scalability",
      description:
        "Effortlessly handle the massive spike in customer service calls during Black Friday and December without hiring temps.",
      metric: "Infinite Scale",
    },
  ];

  const stats = [
    { value: "0", label: "Hold Times" },
    { value: "Infinite", label: "Call Scalability" },
    { value: "+15%", label: "Store Foot Traffic" },
    { value: "24/7", label: "Support Availability" },
  ];

  const testimonial = {
    quote:
      "During the holidays, our retail associates couldn't keep up with both the register line and the phone ringing constantly about store hours and stock checks. B360's AI agent completely eliminated the chaotic ringing. Sales are up, and team morale is way better.",
    author: "Amanda V., Store Manager",
    company: "Lumina Home Goods",
  };

  return (
    <PageLayout
      title="Retail & Offline Stores AI"
      subtitle="Enhance the in-store experience by automating the phones"
      description="Deploy intelligent voice and chat agents to handle inventory checks, store hour inquiries, and order tracking so your retail associates can focus on selling."
      heroGradient="from-pink-50 to-rose-50"
      ctaTitle="Ready to quiet the ringing phones?"
      ctaDescription="Let our AI voice agents handle the repetitive customer questions so your associates can focus on delivering an incredible in-store experience."
    >
      <ContentSection
        title="Complete Retail Automation"
        description="Specifically designed to bridge the gap between offline store operations and digital customer service."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Retail Impact & ROI"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
