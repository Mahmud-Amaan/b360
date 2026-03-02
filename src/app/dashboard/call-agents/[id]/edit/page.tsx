"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAgentsStore } from "@/store/useAgentsStore";

export default function EditAgentPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { agents, isLoading, fetchAgents, updateAgent } = useAgentsStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agentId, setAgentId] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phoneNumber: "",
        phoneSid: "",
        voice: "female",
        welcomeMessage: "",
        businessContext: "",
        businessType: "",
        availabilityContext: "",
        adminEmail: "",
        isActive: true,
    });

    const updateFormData = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    useEffect(() => {
        params.then((resolvedParams) => {
            setAgentId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (agentId && agents.length > 0) {
            const agent = agents.find((a) => a.id === agentId);
            if (agent) {
                setFormData({
                    name: agent.name || "",
                    description: agent.description || "",
                    phoneNumber: agent.phoneNumber || "",
                    phoneSid: agent.phoneSid || "",
                    voice: agent.voice || "female",
                    welcomeMessage: agent.welcomeMessage || "",
                    businessContext: agent.businessContext || "",
                    businessType: agent.businessType || "",
                    availabilityContext: agent.availabilityContext || "",
                    adminEmail: agent.adminEmail || "",
                    isActive: agent.isActive,
                });
            }
        }
    }, [agents, agentId]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Agent name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            await updateAgent(agentId, {
                name: formData.name,
                description: formData.description,
                voice: formData.voice,
                welcomeMessage: formData.welcomeMessage,
                businessContext: formData.businessContext,
                businessType: formData.businessType,
                availabilityContext: formData.availabilityContext,
                adminEmail: formData.adminEmail,
                isActive: formData.isActive,
            });
            router.push(`/dashboard/call-agents/${agentId}`);
        } catch (error) {
            console.error("Error updating agent:", error);
            toast.error("Failed to update agent");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-[200px]" />
                        <Skeleton className="h-4 w-[300px]" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const agent = agents.find((a) => a.id === agentId);
    if (!agent && agentId) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
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

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Agent</CardTitle>
                    <CardDescription>
                        Update your AI call agent configuration
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Basic Settings */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Basic Settings</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Agent Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => updateFormData("name", e.target.value)}
                                        placeholder="My Support Agent"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="voice">Voice</Label>
                                    <Select
                                        value={formData.voice}
                                        onValueChange={(value) => updateFormData("voice", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="neutral">Neutral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                        </div>

                        {/* Phone (Read-only) */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Phone Configuration</h3>
                            <div className="p-4 border rounded-lg bg-gray-50">
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="text-lg font-semibold">{formData.phoneNumber}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Phone number cannot be changed after creation.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                                <Input
                                    id="welcomeMessage"
                                    value={formData.welcomeMessage}
                                    onChange={(e) =>
                                        updateFormData("welcomeMessage", e.target.value)
                                    }
                                    placeholder="Hi! How can I help you today?"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        updateFormData("isActive", checked as boolean)
                                    }
                                />
                                <Label htmlFor="isActive">Agent Active</Label>
                            </div>
                        </div>

                        {/* Business Context */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Business Context</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessType">Business Type</Label>
                                    <Input
                                        id="businessType"
                                        value={formData.businessType}
                                        onChange={(e) =>
                                            updateFormData("businessType", e.target.value)
                                        }
                                        placeholder="e.g., SaaS, E-commerce, Services"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminEmail">Admin Email</Label>
                                    <Input
                                        id="adminEmail"
                                        type="email"
                                        value={formData.adminEmail}
                                        onChange={(e) =>
                                            updateFormData("adminEmail", e.target.value)
                                        }
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="businessContext">Business Details</Label>
                                <Textarea
                                    id="businessContext"
                                    value={formData.businessContext}
                                    onChange={(e) =>
                                        updateFormData("businessContext", e.target.value)
                                    }
                                    placeholder="Describe your business, products, services..."
                                    className="min-h-24"
                                />
                            </div>



                            <div className="space-y-2">
                                <Label htmlFor="availabilityContext">
                                    Availability & Hours
                                </Label>
                                <Textarea
                                    id="availabilityContext"
                                    value={formData.availabilityContext}
                                    onChange={(e) =>
                                        updateFormData("availabilityContext", e.target.value)
                                    }
                                    placeholder="Business hours, holidays, support availability..."
                                    className="min-h-24"
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/call-agents/${agentId}`)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
