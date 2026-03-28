"use client";

import { PageLayout } from "@/components/public/layout/PageLayout";
import { ContentSection } from "@/components/public/layout/ContentSection";
import {
  Users2,
  CalendarCheck,
  FileQuestion,
  UserCheck,
  Briefcase,
  HeadsetIcon,
} from "lucide-react";

export default function RecruitmentPage() {
  const features = [
    {
      title: "Candidate Screening Calls",
      description:
        "AI voice agents conduct preliminary phone interviews, asking required qualification questions and scoring responses.",
      icon: <UserCheck className="w-12 h-12" />,
    },
    {
      title: "Interview Scheduling",
      description:
        "Eliminate back-and-forth emails by letting AI instantly schedule, reschedule, and confirm interviews across calendars.",
      icon: <CalendarCheck className="w-12 h-12" />,
    },
    {
      title: "Applicant FAQs",
      description:
        "Instantly answer candidate questions about company culture, benefits, remote work policies, and hiring timelines.",
      icon: <FileQuestion className="w-12 h-12" />,
    },
    {
      title: "Internal HR Support",
      description:
        "Serve as a 24/7 internal helpdesk for existing employees to ask about PTO balances, tax documents, and healthcare.",
      icon: <Users2 className="w-12 h-12" />,
    },
    {
      title: "Passive Candidate Outreach",
      description:
        "Deploy text and voice outreach to gauge the interest of passive candidates in your talent pool at scale.",
      icon: <Briefcase className="w-12 h-12" />,
    },
    {
      title: "Onboarding Guidance",
      description:
        "Guide new hires through document submission, IT setup, and orientation schedules to ensure a smooth day one.",
      icon: <HeadsetIcon className="w-12 h-12" />,
    },
  ];

  const benefits = [
    {
      title: "Massive Time Savings",
      description:
        "Recruiters save dozens of hours a week by letting AI handle the repetitive initial phone screening stage.",
      metric: "40 Hours/Mo Saved",
    },
    {
      title: "Faster Time-to-Hire",
      description:
        "Instant screening and autonomous scheduling drastically shortens the hiring cycle.",
      metric: "50% Faster",
    },
    {
      title: "Better Candidate Experience",
      description:
        "Candidates appreciate instant responses and the ability to schedule interviews on their own time, day or night.",
      metric: "Higher Engagement",
    },
    {
      title: "Unbiased Screening",
      description:
        "AI asks the exact same questions evaluating skills objectively, promoting a fairer initial screening process.",
      metric: "Objective Scoring",
    },
  ];

  const stats = [
    { value: "50%", label: "Faster Time-to-Hire" },
    { value: "40 hrs", label: "Saved per Recruiter" },
    { value: "24/7", label: "Candidate Support" },
    { value: "100%", label: "Screening Consistency" },
  ];

  const testimonial = {
    quote:
      "Scaling our hiring used to mean brutal days of endless 15-minute phone screens. We integrated B360's voice agents, and they now screen hundreds of applicants overnight, delivering only the top 10% of candidates right to our calendars.",
    author: "Jessica T., Head of Talent",
    company: "Apex Tech Staffing",
  };

  return (
    <PageLayout
      title="Recruitment & HR AI Agents"
      subtitle="Automate candidate screening and reclaim your recruiters' time"
      description="Deploy intelligent AI voice agents to conduct preliminary screening calls, schedule interviews flawlessly, and answer HR questions 24/7."
      heroGradient="from-blue-50 to-indigo-50"
      ctaTitle="Ready to supercharge your recruiting?"
      ctaDescription="Let our AI handle the tedious top-of-funnel screening so your best recruiters can focus on closing top talent."
    >
      <ContentSection
        title="Complete HR Automation"
        description="Specifically designed to alleviate the administrative burden on recruiting teams and HR departments."
        features={features}
        className="bg-white"
      />

      <ContentSection
        title="Recruiting Impact"
        stats={stats}
        benefits={benefits}
        className="bg-gray-50"
      />

      <ContentSection testimonial={testimonial} className="bg-white" />
    </PageLayout>
  );
}
