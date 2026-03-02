"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgentsStore } from "@/store/useAgentsStore";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Edit, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CallAnalytics } from "@/components/dashboard/CallAnalytics";
import { CallLogsTable } from "@/components/dashboard/CallLogsTable";
import { BookingRecords } from "@/components/dashboard/BookingRecords";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { agents, isLoading, fetchAgents, deleteAgent } = useAgentsStore();

    const [agentId, setAgentId] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState(false);

    const [logs, setLogs] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalCalls: 0, avgDuration: 0, totalBookings: 0 });
    const [isLogsLoading, setIsLogsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    useEffect(() => {
        params.then((resolvedParams) => {
            setAgentId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (agentId) {
            fetchLogs();
        }
    }, [agentId]);

    const fetchLogs = async () => {
        setIsLogsLoading(true);
        try {
            const res = await fetch(`/api/agents/${agentId}/logs`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setBookings(data.bookings);
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setIsLogsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this agent?")) return;
        setIsDeleting(true);
        await deleteAgent(agentId);
        router.push("/dashboard/call-agents");
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                        <CardDescription>
                            Please wait while we load your agent.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-64">
                            <div className="text-gray-500">Loading agent data...</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const agent = agents.find((a) => a.id === agentId);
    if (!agent && agentId) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Agent Not Found</CardTitle>
                        <CardDescription>
                            The requested agent could not be found.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/dashboard/call-agents")}>
                            Back to Agents
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!agent) {
        return null; // Still loading
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
                    <p className="text-gray-600 mt-1">
                        {agent.description || "Manage your AI call agent configuration"}
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                        <Badge
                            variant={agent.isActive ? "default" : "secondary"}
                            className={agent.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                            {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
                <div className="flex w-full lg:w-auto gap-3 mt-4 lg:mt-0">
                    <Link href={`/dashboard/call-agents/${agent.id}/edit`} className="flex-1 lg:flex-none">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 w-full" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 lg:flex-none"
                        size="sm"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDeleting ? "..." : "Delete"}
                    </Button>
                </div>
            </div>

            {/* Agent Details */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="w-full overflow-x-auto pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <TabsList className="bg-gray-100 p-1 w-full sm:w-auto inline-flex justify-start">
                        <TabsTrigger value="overview" className="flex-1 sm:flex-none min-w-[100px]">Overview</TabsTrigger>
                        <TabsTrigger value="logs" className="flex-1 sm:flex-none min-w-[100px]">Call Logs</TabsTrigger>
                        <TabsTrigger value="bookings" className="flex-1 sm:flex-none min-w-[100px]">Bookings</TabsTrigger>
                        <TabsTrigger value="settings" className="flex-1 sm:flex-none min-w-[120px]">Configuration</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    <CallAnalytics stats={stats} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Phone className="mr-2 h-5 w-5 text-blue-600" />
                                    Phone Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="text-lg font-semibold">{agent.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Voice</p>
                                    <p className="capitalize">{agent.voice || "female"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Business Identity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Business Type</p>
                                    <p className="text-gray-700">{agent.businessType || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Admin Email</p>
                                    <p className="text-gray-700">{agent.adminEmail || "Not set"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Recent Call Logs</CardTitle>
                                <Button variant="link" onClick={() => setActiveTab("logs")}>
                                    View All →
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <CallLogsTable logs={logs.slice(0, 5)} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Call History</CardTitle>
                            <CardDescription>
                                Detailed records of all interactions with this AI agent.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CallLogsTable logs={logs} onRefresh={fetchLogs} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Records</CardTitle>
                            <CardDescription>
                                Appointments and leads extracted from calls.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingRecords bookings={bookings} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Agent Context</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Welcome Message</p>
                                    <p className="text-gray-700">{agent.welcomeMessage || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Business Details</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {agent.businessContext || "No business context provided."}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Availability & Hours</p>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {agent.availabilityContext || "No availability information provided."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
