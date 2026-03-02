import Sidebar from "@/components/dashboard/sidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="h-full max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
