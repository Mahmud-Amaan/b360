"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContactForm } from "@/components/public/contact/ContactForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import EnhancedWorldMap from "@/components/public/contact/EnhancedWorldMap";

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <Mail className="w-12 h-12" />,
      title: "Email Us",
      description: "Get detailed responses to your inquiries",
      action: "bridgely360official@gmail.com",
      href: "mailto:bridgely360official@gmail.com",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: <Phone className="w-12 h-12" />,
      title: "Call Us",
      description: "Speak directly with our experts",
      action: "+1 (226) 993-0886",
      href: "tel:+12269930886",
      gradient: "from-green-500 to-green-600",
    },
  ];

  return (
    <PageLayout
      title="Get in Touch"
      subtitle="Ready to transform your customer support experience?"
      description="Connect with our global team of experts and discover how B360 can help you deliver exceptional customer experiences that drive business growth."
      heroGradient="from-blue-50 to-indigo-50"
      ctaTitle="Ready to get started?"
      ctaDescription="Let's discuss how our comprehensive support solutions can transform your customer experience."
      ctaButtonText="Schedule a Demo"
      ctaButtonHref="https://calendar.google.com/calendar/embed?src=82249b05f8a6091ca94b230ffb55de2e02369c4618ebe19b3b02ddf2ef64a4fa%40group.calendar.google.com"
    >
      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to transform your business? Connect with our team of
              experts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-gray-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${method.gradient} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {method.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {method.description}
                    </p>
                    <Link href={method.href}>
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-full py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        {method.action}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* World Map Section */}
      <EnhancedWorldMap />

      {/* Contact Form */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
