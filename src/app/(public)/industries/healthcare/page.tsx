"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Stethoscope,
  CalendarCheck,
  HeartPulse,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
} from "lucide-react";

export default function HealthcarePage() {
  const features = [
    {
      title: "Appointment Booking & Rescheduling",
      description:
        "AI agents handle complex scheduling, modifications, and cancellations automatically, integrating directly with your EHR.",
      icon: <CalendarCheck className="w-12 h-12" />,
    },
    {
      title: "Patient Triage & Routing",
      description:
        "Intelligently route patients based on basic symptoms and urgency to ensure they reach the correct department immediately.",
      icon: <Stethoscope className="w-12 h-12" />,
    },
    {
      title: "Automated Reminder Calls",
      description:
        "Reduce no-shows with automated, conversational appointment reminder calls and pre-visit instruction delivery.",
      icon: <PhoneCall className="w-12 h-12" />,
    },
    {
      title: "Insurance Verification FAQs",
      description:
        "Instantly answer common patient questions regarding insurance coverage, billing codes, and payment options.",
      icon: <MessageSquare className="w-12 h-12" />,
    },
    {
      title: "HIPAA Compliant Infrastructure",
      description:
        "Enterprise-grade security and strict compliance measures ensure all patient health information (PHI) remains fully protected.",
      icon: <ShieldCheck className="w-12 h-12" />,
    },
    {
      title: "Post-Discharge Follow-ups",
      description:
        "Proactively check on patients after procedures to monitor recovery and ensure adherence to care plans.",
      icon: <HeartPulse className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Reduced No-Show Rates",
      description:
        "Proactive reminders via voice and text drastically reduce missed appointments.",
      metric: "Up to 40% Less",
    },
    {
      title: "Administrative Efficiency",
      description:
        "Free up your front desk to focus on in-person patients rather than answering repetitive calls.",
      metric: "60% Time Saved",
    },
    {
      title: "Patient Access",
      description:
        "Patients can get answers and book appointments 24/7 without waiting on hold.",
      metric: "Zero Hold Times",
    },
    {
      title: "HIPAA Compliance",
      description:
        "Maintain strict patient data privacy with our highly secure AI infrastructure.",
      metric: "100% Secure",
    },
  ];

  const stats = [
    { value: "40%", label: "Fewer No Shows" },
    { value: "24/7", label: "Patient Access" },
    { value: "0", label: "Min Hold Time" },
    { value: "100%", label: "HIPAA Ready" },
  ];

  const testimonial = {
    quote:
      "Implementing AI voice agents transformed our clinic. Our front desk is no longer overwhelmed by phone calls, our no-show rates plummeted, and patients love that they can call at 10 PM to reschedule an appointment.",
    author: "Dr. Sarah Jenkins",
    company: "Lakeside Medical Group",
  };

  return (
    <PageLayout
      title="Healthcare & Clinics AI Support"
      subtitle="HIPAA-compliant voice agents and chatbotss for modern medical practices"
      description="Streamline patient communications, automate appointment scheduling, and drastically reduce no-shows with our secure, conversational AI agents tailored for healthcare providers."
      heroGradient="from-blue-50 to-emerald-50"
      ctaTitle="Ready to modernize your clinic's patient intake?"
      ctaDescription="Deploy intelligent, secure AI voice agents and chatbotss today to improve patient experiences and free up your staff."
    >
      <ContentSection
        title="Complete Healthcare Communication Solutions"
        description="Our specialized AI solutions for healthcare focus on patient care, compliance, and clinical efficiency."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Medical Practice Impact"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
