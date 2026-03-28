"use client";

import { motion } from "framer-motion";
import { PageLayout } from "@/components/public/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

export default function RcsMessagingPage() {
  const services = [
    {
      title: "RCS Messaging",
      description:
        "Engage customers with rich, interactive, and branded conversations through RCS.",
      icon: <MessageSquare className="w-12 h-12" />,
      features: [
        "Branded messaging",
        "Rich media sharing (images, videos, carousels)",
        "Suggested replies and actions",
        "Read receipts and typing indicators",
        "Secure and verified sender",
        "Chatbots integration",
        "Campaign management",
        "Analytics and reporting",
        "High-resolution photo and video sharing",
        "Group chat capabilities",
        "Location sharing",
        "Seamless integration with existing systems",
      ],
      gradient: "from-purple-500 to-pink-600",
      popular: true,
    },
  ];

  const stats = [
    { number: "10M+", label: "Messages Processed" },
    { number: "98%", label: "Deliverability Rate" },
    { number: "3x", label: "Higher Engagement" },
    { number: "50+", label: "Global Carriers" },
  ];

  return (
    <PageLayout
      title="RCS Messaging Solutions"
      subtitle="The next generation of business messaging"
      description="Upgrade from SMS to RCS (Rich Communication Services) and deliver interactive, app-like experiences directly to your customers' native messaging app."
      heroGradient="from-purple-50 to-pink-50"
      ctaTitle="Ready to revolutionize your customer communication?"
      ctaDescription="Let's explore how RCS messaging can transform your engagement strategy."
      ctaButtonText="Get a Demo"
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
                <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Interactive RCS Messaging
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deliver rich, branded, and actionable messages that capture
              attention and drive results.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-2 border-purple-200 ring-2 ring-purple-100 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-10">
                    <div className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 inline-block">
                      Highlight Service
                    </div>

                    <div className="flex items-center mb-8">
                      <div
                        className={`w-20 h-20 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center text-white mr-6`}
                      >
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2 font-heading">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">
                          Core Features:
                        </h4>
                        <ul className="space-y-3">
                          {service.features
                            .slice(0, 6)
                            .map((feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-center space-x-3"
                              >
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-4 text-lg">
                          Advanced Capabilities:
                        </h4>
                        <ul className="space-y-3">
                          {service.features
                            .slice(6)
                            .map((feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-center space-x-3"
                              >
                                <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        Request a Demo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RCS Spotlight */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white mb-16"
            >
              <Bot className="w-20 h-20 mx-auto mb-8 opacity-90" />
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-heading">
                The Future of A2P Messaging
              </h2>
              <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto">
                Leverage AI-powered chatbotss and rich media to create
                conversational experiences that delight customers and drive
                conversions.
              </p>
            </motion.div>

            <div className="text-center">
              <Link href="/contact">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 py-3 font-bold text-lg shadow-lg">
                  Contact Sales
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
