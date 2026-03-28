"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Database, Shield, Settings, Zap, MessageCircle, Clock, Bot, PhoneCall } from "lucide-react";
import { Header, HeroSection } from "@/components/public/landing";
import { Footer } from "@/components/public/layout/Footer";

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState("");

  const testimonials = [
    {
      name: "JUMBODTG",
      quote:
        "The B360 team is always flexible with process changes and commits 100% to making every interaction the best our clients have ever had on a daily basis.",
      image: "/logos/jumbo_logo.avif",
    },
    {
      name: "lockedin ai",
      quote:
        "B360 transformed our customer support operations. Their proactive approach and dedication to excellence is unmatched.",
      image: "/logos/lockedin_ai_logo.png",
    },
    {
      name: "elavate",
      quote:
        "Working with B360 has been a game-changer. They understand our business needs and deliver exceptional results consistently.",
      image: "/logos/Elavate_Logo_1.avif",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: "50M+",
                label: "Tickets Resolved",
                icon: <MessageCircle className="w-8 h-8" />,
              },
              {
                number: "98%",
                label: "Satisfaction Rate",
                icon: <Shield className="w-8 h-8" />,
              },
              {
                number: "24/7",
                label: "Global Coverage",
                icon: <Clock className="w-8 h-8" />,
              },
              {
                number: "500+",
                label: "Expert Agents",
                icon: <Users className="w-8 h-8" />,
              },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <Card className="border-2 border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white">
                  <CardContent className="p-8">
                    <div className="text-blue-600 flex justify-center mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-lg text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gradient-to-br from-emerald-100 to-indigo-100 py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 font-heading">
              <span className="text-gradient-emerald-indigo">Your</span> success
              is <span className="text-gradient-emerald-indigo">our</span>{" "}
              mission
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-heading">
                You deserve better.
              </h3>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-700">
                <p>
                  You deserve better outcomes, insights, and conversations. You
                  deserve to work with the best proactive teams that embrace
                  complexity, adapt to ambiguity, and flex to your needs with
                  just 24 hours notice. You should be obsessed over, not
                  struggling to scale or sacrificing quality for speed.
                </p>
                <p>
                  Whether you&apos;re a disruptive startup or an iconic brand,
                  with B360 you get more than outsourcing - you get what you
                  deserve.
                </p>
              </div>
            </div>

            {/* Process Diagram */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-emerald-indigo rounded-full flex items-center justify-center text-white font-bold text-xs">
                      SELECT
                      <br />
                      TEAM
                    </div>
                  </div>

                  <div className="flex-1 flex justify-center items-center relative px-2">
                    <div className="w-full border-t-2 border-dashed border-emerald-300"></div>
                    <div className="absolute bg-white p-1 rounded-full border-2 border-emerald-200">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-emerald-indigo rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      LAUNCH
                    </div>
                  </div>

                  <div className="flex-1 flex justify-center items-center relative px-2">
                    <div className="w-full border-t-2 border-dashed border-emerald-300"></div>
                    <div className="absolute bg-white p-1 rounded-full border-2 border-emerald-200">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-emerald-indigo rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      ITERATE
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 font-heading">
                    - 2 WEEKS -
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-emerald-indigo py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 font-heading">
                Ready to transform your operations?
              </h3>
              <p className="text-white/90">
                Let&apos;s discuss how B360 can help you build better teams and
                achieve better outcomes.
              </p>
            </div>
            <Button className="bg-white text-emerald-600 hover:bg-gray-100 rounded-full px-8 py-3 font-bold">
              Take B360 for a spin
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="relative flex-shrink-0">
                <div className="w-32 h-20 sm:w-48 sm:h-24 flex items-center justify-center bg-transparent">
                  <Image
                    src={
                      testimonials[currentTestimonial].image ||
                      "/placeholder.svg"
                    }
                    alt={testimonials[currentTestimonial].name}
                    width={180}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-500 tracking-wider mb-2">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <blockquote className="text-lg sm:text-xl lg:text-2xl text-gray-900 leading-relaxed">
                    &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                  </blockquote>
                </div>
              </div>

              <div className="text-4xl sm:text-6xl text-gray-200 font-serif hidden sm:block">&ldquo;</div>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === currentTestimonial ? "bg-emerald-400" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-heading">
              Next-Gen AI Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Automate your customer interactions across text and voice channels with our intelligent, human-like AI agents. Keep your business running 24/7.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Chatbot Card */}
            <Card className="border-2 border-purple-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 lg:p-12 text-center flex flex-col h-full">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                  AI Chatbots
                </h3>
                <p className="text-gray-600 mb-6 text-lg flex-grow">
                  Embed smart, context-aware chatbot widgets on your website to handle customer inquiries instantly, capture leads, and provide 24/7 support.
                </p>
                <ul className="text-left space-y-3 mb-8 text-gray-700">
                  <li className="flex items-center"><Zap className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" /> Quick and easy embedding</li>
                  <li className="flex items-center"><Zap className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" /> Connects to your knowledge base</li>
                  <li className="flex items-center"><Zap className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" /> Captures leads and escalates automatically</li>
                </ul>
                <Link href="/contact" className="mt-auto">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold">Explore Chatbots</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Voice Agent Card */}
            <Card className="border-2 border-blue-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-8 lg:p-12 text-center flex flex-col h-full">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <PhoneCall className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                  AI Call Agents
                </h3>
                <p className="text-gray-600 mb-6 text-lg flex-grow">
                  Deploy ultra-realistic, low-latency AI voice agents that can pick up inbound phone calls, book meetings, and handle complex conversations like a human.
                </p>
                <ul className="text-left space-y-3 mb-8 text-gray-700">
                  <li className="flex items-center"><Zap className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" /> Human-like conversational voice</li>
                  <li className="flex items-center"><Zap className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" /> Instant phone number provisioning</li>
                  <li className="flex items-center"><Zap className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" /> Books meetings & triggers workflows</li>
                </ul>
                <Link href="/contact" className="mt-auto">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold">Explore Voice Agents</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-heading">
              + More Growth, Less Risk
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Focus on growth, we&apos;ll take care of the many small tasks that
              make the difference between awesome and awful.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Customer Support",
                description:
                  "Across time zones, languages, cultures, and channels, we&apos;ll leave your customers feeling great about your brand...even if it&apos;s a bad day.",
                icon: <Users className="w-12 h-12" />,
                color: "border-emerald-200 bg-emerald-50",
                iconColor: "text-emerald-500",
              },
              {
                title: "Data & AI",
                description:
                  "Process and build with better, less biased, more accurate training data. You know your end product depends on it; we do too.",
                icon: <Database className="w-12 h-12" />,
                color: "border-indigo-200 bg-indigo-50",
                iconColor: "text-indigo-500",
              },
              {
                title: "Trust & Safety",
                description:
                  "Better compliance, higher engagement, and safer spaces. We&apos;ll keep your users playing by your rules.",
                icon: <Shield className="w-12 h-12" />,
                color: "border-purple-200 bg-purple-50",
                iconColor: "text-purple-500",
              },
              {
                title: "Digital Operations",
                description:
                  "Crash costs cut friction, and boost efficiency. We&apos;ll help you scale your operations faster and more profitably... and put years back on your life.",
                icon: <Settings className="w-12 h-12" />,
                color: "border-teal-200 bg-teal-50",
                iconColor: "text-teal-500",
              },
            ].map((service, i) => (
              <Card
                key={i}
                className={`${service.color} border-2 hover:shadow-lg transition-all duration-300 group`}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div className={`${service.iconColor} flex justify-center`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-heading">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                  <Button className="bg-gradient-emerald-indigo text-white hover:opacity-90 rounded-full px-6 group-hover:scale-105 transition-transform font-medium">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer with Animated Background */}
      <section className="relative bg-gradient-to-br from-emerald-50 to-indigo-50 py-20 overflow-hidden">
        {/* Animated Smiley Faces Background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              😊
            </div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 font-heading">
              Outsourcing +<br />
              built to make you better.
            </h2>
            <Button className=" rounded-full px-8 py-3 text-lg font-bold">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
