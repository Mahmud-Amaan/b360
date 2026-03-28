import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  MessageSquare,
  WorkflowIcon as Chatbots,
  Headset as CallAgentIcon,
  Plus,
  ExternalLink,
} from "lucide-react";
import { getDashboardAnalytics } from "@/lib/user-utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface DashboardData {
  stats: {
    totalMessages: number;
    activeChatbots: number;
    activeCallAgents: number;
  };
}

export default async function DashboardPage() {
  const data = (await getDashboardAnalytics()) as DashboardData;

  if (!data) return null;

  return (
    <div className="space-y-8 p-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalMessages.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Chatbots
            </CardTitle>
            <Chatbots className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeChatbots}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Call Agents
            </CardTitle>
            <CallAgentIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeCallAgents}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {/* Chatbots Section */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Chatbots className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-xl">Active Chatbots</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  {data.stats.activeChatbots}
                </Badge>
              </div>
              <Link href="/dashboard/chatbots">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.stats.activeChatbots === 0 ? (
              <div className="text-center py-12">
                <Chatbots className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No chatbots created yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first chatbot to start collecting messages from your
                  customers.
                </p>
                <Link href="/dashboard/chatbots/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Chatbot
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  You have {data.stats.activeChatbots} active chatbot
                  {data.stats.activeChatbots !== 1 ? "s" : ""}.
                </p>
                <Link href="/dashboard/chatbots">
                  <Button variant="outline" className="mt-4">
                    Manage Chatbots
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call Agents Section */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CallAgentIcon className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Active Call Agents</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {data.stats.activeCallAgents}
                </Badge>
              </div>
              <Link href="/dashboard/call-agents">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  View All
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.stats.activeCallAgents === 0 ? (
              <div className="text-center py-12">
                <CallAgentIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No call agents created yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI voice agent to start handling customer calls.
                </p>
                <Link href="/dashboard/call-agents/new">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Agent
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  You have {data.stats.activeCallAgents} active call agent
                  {data.stats.activeCallAgents !== 1 ? "s" : ""}.
                </p>
                <Link href="/dashboard/call-agents">
                  <Button variant="outline" className="mt-4">
                    Manage Call Agents
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
