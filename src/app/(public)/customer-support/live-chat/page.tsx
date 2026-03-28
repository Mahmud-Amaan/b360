"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageCircle,
  Bot,
  Zap,
  Globe,
  Users,
  ArrowRight,
  Smartphone,
  Monitor,
  Shield,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function LiveChatSupportPage() {
  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI-Powered Chat",
      description: "Intelligent chatbotss with human agent escalation for complex issues.",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Response",
      description: "Real-time messaging with average response time under 30 seconds.",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Platform",
      description: "Seamless chat experience across web, mobile, and social platforms.",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Detailed chat analytics and customer satisfaction tracking.",
      gradient: "from-orange-500 to-red-600",
    },
  ];

  const chatFeatures = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Real-Time Messaging",
      description: "Instant communication with typing indicators and read receipts",
      features: ["Live typing indicators", "Message delivery status", "File sharing", "Emoji support"],
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI Chat Assistant",
      description: "Intelligent bot handling common queries with human escalation",
      features: ["Natural language processing", "Intent recognition", "Smart routing", "Learning capabilities"],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Agent Management",
      description: "Efficient agent routing and workload distribution",
      features: ["Skill-based routing", "Load balancing", "Queue management", "Performance tracking"],
    },
  ];

  const stats = [
    { value: "< 30s", label: "Average Response Time" },
    { value: "98%", label: "Customer Satisfaction" },
    { value: "24/7", label: "Chat Availability" },
    { value: "85%", label: "First Message Resolution" },
  ];

  const platforms = [
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "Website Chat",
      description: "Embedded chat chatbot for your website",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile App",
      description: "Native mobile chat experience",
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Social Media",
      description: "Unified chat across social platforms",
    },
  ];

  return (
    <PageLayout
      title="Live Chat Support"
      subtitle="Instant customer support through intelligent live chat solutions"
      description="Provide immediate assistance to your customers with our AI-powered live chat platform featuring real-time messaging and seamless agent escalation."
      heroGradient="from-blue-50 to-indigo-50"
      ctaTitle="Ready to implement live chat support?"
      ctaDescription="Transform your customer service with instant messaging and AI-powered assistance."
      ctaButtonText="Start Live Chat"
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
                <div className="text-3xl font-bold text-indigo-600 mb-2">
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
              Advanced Live Chat Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our live chat platform combines AI intelligence with human expertise
              to deliver exceptional customer support experiences.
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

      {/* Chat Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Chat Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered automation to human agent support, we provide complete chat solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {chatFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-center">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                          {item}
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

      {/* Platforms Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Multi-Platform Chat Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Provide consistent chat experiences across all customer touchpoints.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                      {platform.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {platform.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">{platform.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                See Live Chat in Action
              </h2>
              <p className="text-xl text-gray-600">
                Experience the power of our live chat platform with real-time features.
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
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Instant Connectivity</h3>
                      <p className="text-gray-600">Connect with customers the moment they need help.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Secure Messaging</h3>
                      <p className="text-gray-600">End-to-end encryption ensures customer data protection.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Performance Analytics</h3>
                      <p className="text-gray-600">Track chat performance and customer satisfaction metrics.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white"
              >
                <h3 className="text-2xl font-bold mb-6">Live Chat Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Active Chats</span>
                    <span className="font-bold">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Response Time</span>
                    <span className="font-bold">28s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resolution Rate</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Satisfaction Score</span>
                    <span className="font-bold">4.8/5</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <MessageCircle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Start Live Chat Support Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Transform your customer service with instant messaging and AI-powered assistance.
              Provide the immediate support your customers expect.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold mb-2">100K+</div>
                <div className="opacity-90">Messages Handled</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="opacity-90">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">&lt;30s</div>
                <div className="opacity-90">Response Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="opacity-90">Availability</div>
              </div>
            </div>
            <Link href="/contact">
              <Button className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8 py-3 font-bold text-lg shadow-lg">
                Start Live Chat
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
