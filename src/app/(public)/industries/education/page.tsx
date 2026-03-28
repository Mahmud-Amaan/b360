"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  GraduationCap,
  BookOpen,
  CalendarDays,
  CreditCard,
  Users,
  MessageCircle,
} from "lucide-react";

export default function EducationPage() {
  const features = [
    {
      title: "Admission Inquiries",
      description:
        "Answer prospective student questions about deadlines, requirements, and tuitions accurately, 24/7.",
      icon: <GraduationCap className="w-12 h-12" />,
    },
    {
      title: "Course Recommendations",
      description:
        "Guide students through curriculum options and suggest courses based on their interests and career goals.",
      icon: <BookOpen className="w-12 h-12" />,
    },
    {
      title: "Student Support & IT",
      description:
        "Provide instant help for password resets, portal access, and general campus information.",
      icon: <MessageCircle className="w-12 h-12" />,
    },
    {
      title: "Fee & Payment Reminders",
      description:
        "Automate outbound calls or texts to remind parents or students of upcoming tuition deadlines.",
      icon: <CreditCard className="w-12 h-12" />,
    },
    {
      title: "Campus Tour Scheduling",
      description:
        "Allow prospective students to seamlessly book campus tours directly over the phone or via chat.",
      icon: <CalendarDays className="w-12 h-12" />,
    },
    {
      title: "Alumni Engagement",
      description:
        "Keep alumni informed and nurture donation campaigns with personalized, conversational outreach.",
      icon: <Users className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Increased Admissions",
      description:
        "Capture prospective student interest instantly, even outside of traditional admissions office hours.",
      metric: "25% Higher Enrollment",
    },
    {
      title: "Reduced Admin Burden",
      description:
        "Drastically cut down the time staff spends answering routine questions about deadlines and fees.",
      metric: "40% Time Saved",
    },
    {
      title: "Better Student Experience",
      description:
        "Students expect instant, digital-first support. Meet them where they are with intelligent chatbotss.",
      metric: "98% Satisfaction",
    },
    {
      title: "Improved Collections",
      description:
        "Friendly, automated fee reminders significantly decrease late payments and administrative chasing.",
      metric: "Reduced Late Fees",
    },
  ];

  const stats = [
    { value: "25%", label: "Admissions Boost" },
    { value: "24/7", label: "Student Support" },
    { value: "40%", label: "Admin Time Saved" },
    { value: "Thousands", label: "FAQs Handled" },
  ];

  const testimonial = {
    quote:
      "During peak enrollment season, our small admissions team used to drown in repetitive phone calls. Now, B360's voice agents handle 80% of those FAQs seamlessly, allowing our counselors to focus on actual interviews and decision-making.",
    author: "Dr. Elena Rodriguez",
    company: "Midwest Technical College",
  };

  return (
    <PageLayout
      title="Education & EdTech AI Agents"
      subtitle="Modernize admissions and student support with conversational AI"
      description="Deploy intelligent voice and chat agents to handle admission inquiries, schedule campus tours, and support students 24/7, reducing the massive administrative burden on your staff."
      heroGradient="from-indigo-50 to-purple-50"
      ctaTitle="Ready to scale your student support?"
      ctaDescription="Let our intelligent AI agents answer questions, book tours, and collect tuition reminders for your institution today."
    >
      <ContentSection
        title="Intelligent Education Solutions"
        description="Specifically tailored for schools, universities, bootcamps, and EdTech platforms."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Impact on Enrollment & Operations"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
