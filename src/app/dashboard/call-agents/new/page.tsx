"use client";

import React from "react"

import { useState } from "react";
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
import { toast } from "sonner";
import { Search, Phone, CheckCircle, Loader2 } from "lucide-react";
import { useAgentsStore } from "@/store/useAgentsStore";

type PhoneNumber = {
    phoneNumber: string;
    friendlyName: string;
    isoCountry: string;
    locality: string;
    region: string;
    price?: string;
    currency?: string;
};

const getCurrencySymbol = (code?: string) => {
    if (!code) return '$';
    switch (code.toUpperCase()) {
        case 'GBP': return '£';
        case 'EUR': return '€';
        case 'AUD': return 'A$';
        case 'CAD': return 'C$';
        case 'INR': return '₹';
        default: return '$';
    }
};

export default function AICallAgentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createAgent } = useAgentsStore();

    // Twilio Search State
    const [isSearching, setIsSearching] = useState(false);
    const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
    const [searchAreaCode, setSearchAreaCode] = useState("");
    const [searchContains, setSearchContains] = useState(""); // For pattern matching (e.g., digits in number)
    const [searchLocality, setSearchLocality] = useState(""); // City filter
    const [searchRegion, setSearchRegion] = useState(""); // State/Province filter
    const [isBuying, setIsBuying] = useState(false);

    const [formData, setFormData] = useState({
        agentName: "",
        agentDescription: "",
        phoneNumber: "",
        phoneSid: "", // Hidden field for Twilio SID
        phoneCountry: "US" as const, // Changed default to US country code
        agentVoice: "female" as const,
        primaryColor: "#6366F1",
        widgetTitle: "Call with AI Agent",
        welcomeMessage: "Hi! How can I help you today?",
        isActive: true,
        businessContext: "",
        businessType: "",
        availabilityContext: "",
        adminEmail: "",
    });

    const updateFormData = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSearchNumbers = async () => {
        setIsSearching(true);
        try {
            const res = await fetch("/api/twilio/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    areaCode: searchAreaCode || undefined,
                    countryCode: formData.phoneCountry,
                    contains: searchContains || undefined,
                    locality: searchLocality || undefined,
                    region: searchRegion || undefined,
                }),
            });

            if (!res.ok) throw new Error("Failed to search numbers");

            const numbers = await res.json();
            setAvailableNumbers(numbers);
            if (numbers.length === 0) {
                toast.info("No numbers found for your search criteria.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to search numbers");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectNumber = (number: PhoneNumber) => {
        updateFormData("phoneNumber", number.phoneNumber);
        // We don't have SID yet because we haven't bought it
        setAvailableNumbers([]); // Clear search results on selection
        toast.info(`Initial selection: ${number.phoneNumber}. Number will be purchased when agent is created.`);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agentName.trim()) {
            toast.error("Agent name is required");
            return;
        }
        if (!formData.phoneNumber.trim()) {
            toast.error("Please select a phone number first");
            return;
        }

        if (!formData.businessContext.trim()) {
            toast.error("Business context is required");
            return;
        }
        if (!formData.adminEmail.trim()) {
            toast.error("Admin email is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const created = await createAgent({
                name: formData.agentName,
                description: formData.agentDescription,
                phoneNumber: formData.phoneNumber,
                phoneSid: formData.phoneSid, // Will be empty if new number
                voice: formData.agentVoice,
                welcomeMessage: formData.welcomeMessage,
                businessContext: formData.businessContext,
                businessType: formData.businessType,
                availabilityContext: formData.availabilityContext,
                adminEmail: formData.adminEmail,
                isActive: formData.isActive,
            });
            if (created) {
                router.push("/dashboard/call-agents");
            }
        } catch (error) {
            console.error("Error creating agent:", error);
            // Error handling is inside createAgent store
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Create AI Call Agent
                            </CardTitle>
                            <CardDescription>
                                Set up an intelligent voice agent to handle incoming calls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={onSubmit}>
                                <div className="space-y-6">
                                    {/* Basic Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Basic Settings
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="agentName">Agent Name</Label>
                                                <Input
                                                    id="agentName"
                                                    placeholder="My Support Agent"
                                                    value={formData.agentName}
                                                    onChange={(e) =>
                                                        updateFormData("agentName", e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="agentVoice">Voice Gender</Label>
                                                <Select
                                                    value={formData.agentVoice}
                                                    onValueChange={(value) =>
                                                        updateFormData("agentVoice", value)
                                                    }
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

                                    {/* Phone Configuration */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Phone Configuration
                                        </h3>

                                        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                            {!formData.phoneNumber ? (
                                                <div className="space-y-4">
                                                    <Label>Search and Buy a Number</Label>

                                                    {/* Country Selector Row */}
                                                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                                        <Select
                                                            value={formData.phoneCountry}
                                                            onValueChange={(value) => {
                                                                updateFormData("phoneCountry", value);
                                                                setAvailableNumbers([]); // Clear results on country change
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-52">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="US">🇺🇸 United States (+1)</SelectItem>
                                                                <SelectItem value="CA">🇨🇦 Canada (+1)</SelectItem>
                                                                <SelectItem value="GB">🇬🇧 United Kingdom (+44)</SelectItem>
                                                                <SelectItem value="AU">🇦🇺 Australia (+61)</SelectItem>
                                                                <SelectItem value="NZ">🇳🇿 New Zealand (+64)</SelectItem>
                                                                <SelectItem value="DE">🇩🇪 Germany (+49)</SelectItem>
                                                                <SelectItem value="FR">🇫🇷 France (+33)</SelectItem>
                                                                <SelectItem value="ES">🇪🇸 Spain (+34)</SelectItem>
                                                                <SelectItem value="IT">🇮🇹 Italy (+39)</SelectItem>
                                                                <SelectItem value="NL">🇳🇱 Netherlands (+31)</SelectItem>
                                                                <SelectItem value="IE">🇮🇪 Ireland (+353)</SelectItem>
                                                                <SelectItem value="IN">🇮🇳 India (+91)</SelectItem>
                                                                <SelectItem value="SG">🇸🇬 Singapore (+65)</SelectItem>
                                                                <SelectItem value="HK">🇭🇰 Hong Kong (+852)</SelectItem>
                                                                <SelectItem value="JP">🇯🇵 Japan (+81)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full sm:w-auto"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await fetch("/api/twilio/existing");
                                                                    if (!res.ok) throw new Error("No existing number");
                                                                    const data = await res.json();
                                                                    updateFormData("phoneNumber", data.phoneNumber);
                                                                    updateFormData("phoneSid", data.sid);
                                                                    toast.success(`Using existing number: ${data.phoneNumber}`);
                                                                } catch {
                                                                    toast.error("No existing number configured in environment");
                                                                }
                                                            }}
                                                        >
                                                            Use Existing
                                                        </Button>
                                                    </div>

                                                    {/* Search Filters Grid */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-500">Area Code</Label>
                                                            <Input
                                                                placeholder="e.g. 415"
                                                                value={searchAreaCode}
                                                                onChange={(e) => setSearchAreaCode(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-500">Number Pattern</Label>
                                                            <Input
                                                                placeholder="e.g. 555"
                                                                value={searchContains}
                                                                onChange={(e) => setSearchContains(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-500">City</Label>
                                                            <Input
                                                                placeholder="e.g. San Francisco"
                                                                value={searchLocality}
                                                                onChange={(e) => setSearchLocality(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs text-gray-500">State/Region</Label>
                                                            <Input
                                                                placeholder="e.g. CA"
                                                                value={searchRegion}
                                                                onChange={(e) => setSearchRegion(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Search Button */}
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={handleSearchNumbers}
                                                        disabled={isSearching}
                                                        className="w-full"
                                                    >
                                                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                                                        Search Available Numbers
                                                    </Button>

                                                    {availableNumbers.length > 0 && (
                                                        <div className="mt-4 border rounded-md divide-y bg-white max-h-60 overflow-y-auto">
                                                            {availableNumbers.map((num) => (
                                                                <div key={num.phoneNumber} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{num.friendlyName}</span>
                                                                        <span className="text-xs text-gray-500">{num.locality}, {num.region}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                                        <div className="text-right">
                                                                            <span className="block text-sm font-semibold text-blue-600">
                                                                                {getCurrencySymbol(num.currency)}
                                                                                {num.price || "1.15"}/mo
                                                                            </span>
                                                                            <span className="block text-[10px] text-gray-400">Monthly price</span>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            onClick={() => handleSelectNumber(num)}
                                                                        >
                                                                            Select
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-green-100 p-2 rounded-full">
                                                            <Phone className="h-5 w-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-green-900">Number Acquired</p>
                                                            <p className="text-green-700">{formData.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            updateFormData("phoneNumber", "");
                                                            updateFormData("phoneSid", "");
                                                        }}
                                                        className="text-green-700 hover:text-green-800 hover:bg-green-100"
                                                    >
                                                        Change
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <div className="space-y-2">
                                                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                                                <Input
                                                    id="welcomeMessage"
                                                    placeholder="Hi! How can I help you today?"
                                                    value={formData.welcomeMessage}
                                                    onChange={(e) =>
                                                        updateFormData("welcomeMessage", e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isActive"
                                                checked={formData.isActive}
                                                onCheckedChange={(checked) =>
                                                    updateFormData("isActive", checked)
                                                }
                                            />
                                            <Label htmlFor="isActive">Agent Active</Label>
                                        </div>
                                    </div>

                                    {/* Business Context */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Business Context
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="businessType">Business Type</Label>
                                                <Input
                                                    id="businessType"
                                                    placeholder="e.g., SaaS, E-commerce, Services"
                                                    value={formData.businessType}
                                                    onChange={(e) =>
                                                        updateFormData("businessType", e.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="adminEmail">Admin Email</Label>
                                                <Input
                                                    id="adminEmail"
                                                    type="email"
                                                    placeholder="admin@example.com"
                                                    value={formData.adminEmail}
                                                    onChange={(e) =>
                                                        updateFormData("adminEmail", e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="businessContext">Business Details</Label>
                                            <Textarea
                                                id="businessContext"
                                                placeholder="Describe your business, products, services, and key information..."
                                                value={formData.businessContext}
                                                onChange={(e) =>
                                                    updateFormData("businessContext", e.target.value)
                                                }
                                                className="min-h-24"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Agent Context */}
                                    <div className="space-y-4">

                                        <div className="space-y-2">
                                            <Label htmlFor="availabilityContext">Availability & Hours</Label>
                                            <Textarea
                                                id="availabilityContext"
                                                placeholder="Describe your business hours, holidays, support availability, and scheduling information..."
                                                value={formData.availabilityContext}
                                                onChange={(e) =>
                                                    updateFormData("availabilityContext", e.target.value)
                                                }
                                                className="min-h-24"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex justify-end gap-3 pt-6 border-t">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push("/dashboard")}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Creating..." : "Create Agent"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}
