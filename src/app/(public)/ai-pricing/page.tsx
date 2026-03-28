"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { plans } from "@/lib/config/plans";
import { getStripePriceId } from "@/lib/config/stripe";

export default function AiPricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planType: "pro" | "free") => {
    if (!session) {
      router.push("/signin");
      return;
    }

    setLoading(planType);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: getStripePriceId(),
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(null);
    }
  };

  const pricingPlans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "/month",
      description:
        "Get started with basic AI features and explore our platform",
      icon: <Check className="w-8 h-8" />,
      features: [
        "20 AI messages per month",
        "1 chat chatbot",
        "Basic analytics",
        "Email support",
        "Standard AI responses"
      ],
      popular: false,
      gradient: "from-gray-500 to-gray-600",
      planType: "free" as const,
      ctaText: "Get Started",
      ctaHref: "/signin",
    },
    {
      name: plans.pro.name,
      price: "$9",
      period: "/month",
      description:
        "Professional AI-powered customer support for growing businesses",
      icon: <Zap className="w-8 h-8" />,
      features: plans.pro.features,
      popular: true,
      gradient: "from-indigo-500 to-purple-500",
      planType: "pro" as const,
      ctaText: "Subscribe Now",
    },
  ];

  const features = [
    {
      title: "Transparent Pricing",
      description:
        "No hidden fees or surprise charges. Our pricing is straightforward and scales with your business needs.",
      icon: <Check className="w-12 h-12" />,
    },
    {
      title: "Flexible Scaling",
      description:
        "Easily upgrade or downgrade your plan as your business grows. Pay only for what you need.",
      icon: <Zap className="w-12 h-12" />,
    },
    {
      title: "ROI Guarantee",
      description:
        "We're confident in our value. Most clients see positive ROI within the first 90 days.",
      icon: <Star className="w-12 h-12" />,
    },
  ];

  const stats = [
    { value: "90%", label: "Client Retention Rate" },
    { value: "< 2 weeks", label: "Implementation Time" },
    { value: "40%", label: "Average Cost Savings" },
    { value: "24/7", label: "Support Availability" },
  ];

  return (
    <PageLayout
      title="AI-Powered Support Pricing"
      subtitle="Unlock the power of AI to elevate your customer experience."
      description="Our AI plan is designed to help you automate and optimize your support channels."
      heroGradient="from-emerald-50 to-indigo-50"
      ctaTitle="Ready to get started?"
      ctaDescription="Contact us for a custom quote or to discuss your specific requirements."
      ctaButtonText="Get Custom Quote"
    >
      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`relative border-2 hover:shadow-xl transition-all duration-300 h-full ${plan.popular
                      ? "border-indigo-200 shadow-lg scale-105"
                      : "border-gray-200 hover:border-blue-200"
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}
                      >
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.planType === "free" ? (
                      <Button
                        onClick={() => router.push(plan.ctaHref!)}
                        className="w-full py-3 font-bold rounded-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
                      >
                        {plan.ctaText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.planType)}
                        disabled={loading === plan.planType}
                        className={`w-full py-3 font-bold rounded-full ${plan.popular
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          }`}
                      >
                        {loading === plan.planType ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {plan.ctaText}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ContentSection
        title="Why Choose B360?"
        description="Our pricing reflects our commitment to delivering exceptional value and measurable results for your business."
        features={features}
        stats={stats}
        className="bg-gray-50"
      />
    </PageLayout>
  );
}
