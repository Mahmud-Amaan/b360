"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PhoneCall,
  Zap,
  Bot,
  Mic2,
  CalendarCheck,
  Languages,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function AICallAgentsPage() {
  const features = [
    {
      icon: <Mic2 className="w-8 h-8" />,
      title: "Human-Like Voice",
      description: "Ultra-realistic, low-latency AI voices that sound and converse just like a human assistant.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Provisioning",
      description: "Get local or toll-free phone numbers in seconds and deploy your agent immediately.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: <CalendarCheck className="w-8 h-8" />,
      title: "Autonomous Booking",
      description: "AI agents can check availability and book meetings directly into your calendar.",
      iconColor: "text-emerald-500",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "Multi-Language",
      description: "Support customers globally with AI agents that speak and understand 50+ languages.",
      gradient: "from-purple-500 to-violet-600",
    },
  ];

  const aiCapabilities = [
    {
      icon: <PhoneCall className="w-6 h-6" />,
      title: "Inbound Call Handling",
      description: "Never miss a lead. AI answers every call on the first ring, 24/7.",
      features: ["No hold times", "Smart triage", "Instant qualification"],
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Intelligent Workflows",
      description: "AI can trigger actions in your CRM, send follow-up texts, or escalate to humans.",
      features: ["CRM integration", "Webhook support", "Real-time logging"],
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Compliance & Security",
      description: "Enterprise-grade security ensuring all voice data is handled safely.",
      features: ["Data encryption", "PII redaction", "SOC2 compliant"],
    },
  ];

  const stats = [
    { value: "0 ms", label: "Latency" },
    { value: "24/7", label: "Availability" },
    { value: "100%", label: "Lead Capture" },
    { value: "50+", label: "Languages" },
  ];

  return (
    <PageLayout
      title="AI Call Agents"
      subtitle="Ultra-realistic AI voice agents for 24/7 automated phone support"
      description="Deploy intelligent voice assistants that answer every call instantly, qualify leads, and book meetings—freeing your staff from the phones."
      heroGradient="from-blue-50 to-emerald-50"
      ctaTitle="Ready to automate your phone lines?"
      ctaDescription="Experience the future of voice interactions. Deploy your first AI call agent in minutes."
      ctaButtonText="Launch Your AI Agent"
    >
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Voice AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI call agents use state-of-the-art neural TTS and natural language understanding to provide a flawless caller experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-4`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Voice Automation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From lead capture to complex meeting scheduling, our AI agents handle it all.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {aiCapabilities.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-center">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AI Agents Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Switch to AI Call Agents?
              </h2>
              <p className="text-xl text-gray-600">
                Traditional call centers are expensive and slow. B360 AI is neither.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Zero Wait Time</h3>
                      <p className="text-gray-600">AI agents answer every call immediately, eliminating frustrating hold times for your customers.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Infinite Scalability</h3>
                      <p className="text-gray-600">Handle 10 calls or 10,000 calls simultaneously without hiring a single additional person.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">80% Cost Reduction</h3>
                      <p className="text-gray-600">Automate routine inquiries for a fraction of the cost of a traditional call center.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl"
              >
                <h3 className="text-2xl font-bold mb-6">ROI Comparison</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span>Feature</span>
                    <span className="font-bold">B360 AI</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Answer Time</span>
                    <span className="font-bold text-emerald-300">&lt; 1s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost per Minute</span>
                    <span className="font-bold text-emerald-300">$0.15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Training Time</span>
                    <span className="font-bold text-emerald-300">Minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>24/7 Service</span>
                    <span className="font-bold text-emerald-300">Included</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-indigo-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <Bot className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4 font-heading">
              Ready to automate your phones?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of businesses using B360 AI Call Agents to reclaim their time and capture every lead.
            </p>
            <Link href="/contact">
              <Button className="bg-white text-blue-700 hover:bg-gray-100 rounded-full px-10 py-4 font-bold text-lg shadow-xl transition-transform hover:scale-105">
                Launch Your AI Agent Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
