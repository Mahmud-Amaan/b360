"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, isToday, isThisWeek, isThisMonth, subDays } from "date-fns";
import {
    Phone,
    Clock,
    FileText,
    ChevronRight,
    ChevronLeft,
    MessageSquare,

    Calendar,
    Search,
    Filter,
    Copy,
    Check,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface CallLog {
    id: string;
    callerNumber: string | null;
    duration: number | null;
    summary: string | null;
    transcript: string | null;

    createdAt: string;
}

interface CallLogsTableProps {
    logs: CallLog[];
    onRefresh?: () => void;
}

function formatDuration(seconds: number | null): string {
    if (!seconds || seconds === 0) return "< 1s";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

/**
 * Parse transcript from various Vapi formats
 */
function parseTranscript(transcript: string | null): Array<{ role: "ai" | "user" | "system"; text: string }> {
    if (!transcript) return [];

    const messages: Array<{ role: "ai" | "user" | "system"; text: string }> = [];
    const lines = transcript.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Format 1: "AI: text" or "User: text"
        if (/^AI:\s*/i.test(trimmedLine)) {
            messages.push({ role: "ai", text: trimmedLine.replace(/^AI:\s*/i, '') });
        } else if (/^User:\s*/i.test(trimmedLine)) {
            messages.push({ role: "user", text: trimmedLine.replace(/^User:\s*/i, '') });
        }
        // Format 2: "assistant: text" or "user: text"
        else if (/^assistant:\s*/i.test(trimmedLine)) {
            messages.push({ role: "ai", text: trimmedLine.replace(/^assistant:\s*/i, '') });
        } else if (/^user:\s*/i.test(trimmedLine)) {
            messages.push({ role: "user", text: trimmedLine.replace(/^user:\s*/i, '') });
        }
        // Format 3: "[AI]" or "[User]" prefixes
        else if (/^\[AI\]/i.test(trimmedLine)) {
            messages.push({ role: "ai", text: trimmedLine.replace(/^\[AI\]\s*/i, '') });
        } else if (/^\[User\]/i.test(trimmedLine)) {
            messages.push({ role: "user", text: trimmedLine.replace(/^\[User\]\s*/i, '') });
        }
        // Format 4: Check for speaker labels with timestamps like "Speaker 1 (00:05):"
        else if (/^Speaker\s*1/i.test(trimmedLine)) {
            messages.push({ role: "ai", text: trimmedLine.replace(/^Speaker\s*1[^:]*:\s*/i, '') });
        } else if (/^Speaker\s*2/i.test(trimmedLine)) {
            messages.push({ role: "user", text: trimmedLine.replace(/^Speaker\s*2[^:]*:\s*/i, '') });
        }
        // Format 5: Plain text - alternate between AI and User
        else {
            // Check if last message was AI, then this is User, and vice versa
            const lastRole = messages.length > 0 ? messages[messages.length - 1].role : "user";
            messages.push({ role: lastRole === "ai" ? "user" : "ai", text: trimmedLine });
        }
    }

    return messages;
}

function TranscriptDisplay({ transcript }: { transcript: string | null }) {
    const [copied, setCopied] = useState(false);
    const messages = parseTranscript(transcript);

    const copyTranscript = () => {
        if (transcript) {
            navigator.clipboard.writeText(transcript);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!transcript || messages.length === 0) {
        return (
            <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 italic">No transcript available for this call.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sticky top-0 bg-white p-2 z-10 border-b">
                <span className="text-sm text-gray-500 font-medium">{messages.length} messages</span>
                <Button variant="outline" size="sm" onClick={copyTranscript} className="h-8">
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    {copied ? "Copied" : "Copy"}
                </Button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-[50vh] overflow-y-auto space-y-3">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={cn(
                            "p-4 rounded-xl text-sm",
                            msg.role === "ai" && "bg-indigo-50 border-l-4 border-indigo-400 ml-0 mr-12",
                            msg.role === "user" && "bg-green-50 border-l-4 border-green-400 ml-12 mr-0",
                            msg.role === "system" && "bg-gray-100 mx-6"
                        )}
                    >
                        <span className={cn(
                            "font-semibold text-xs uppercase tracking-wide block mb-2",
                            msg.role === "ai" && "text-indigo-600",
                            msg.role === "user" && "text-green-600",
                            msg.role === "system" && "text-gray-600"
                        )}>
                            {msg.role === "ai" ? "🤖 AI Assistant" : msg.role === "user" ? "👤 Caller" : "📋 System"}
                        </span>
                        <span className="text-gray-700 leading-relaxed">{msg.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CallLogCard({ log }: { log: CallLog }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all duration-200 group border-2">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            {/* Left side - Caller info */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                    <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-lg text-gray-900">
                                        {log.callerNumber || "Web Call"}
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                            </div>

                            {/* Right side - Stats */}
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Clock className="h-5 w-5 text-indigo-500" />
                                        <span className="font-bold text-lg">{formatDuration(log.duration)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Duration</p>
                                </div>
                                <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                        </div>

                        {/* Summary preview */}
                        {log.summary && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">AI Summary</span>
                                    <div className="text-sm text-gray-600 prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 [&>*]:my-0 line-clamp-3 leading-relaxed">
                                        <ReactMarkdown>{log.summary}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </DialogTrigger>

            {/* Full Details Dialog */}
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                        <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                            <Phone className="h-5 w-5 text-white" />
                        </div>
                        <div className="space-y-1">
                            <span className="block text-xl sm:text-lg">Call Details</span>
                            <span className="text-sm font-normal text-gray-500 block leading-tight">
                                <span className="block sm:inline">{log.callerNumber || "Web Call"}</span>
                                <span className="hidden sm:inline"> • </span>
                                <span className="block sm:inline text-xs sm:text-sm mt-1 sm:mt-0">
                                    {format(new Date(log.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                                </span>
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <Clock className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                            <p className="text-lg font-bold text-gray-900">{formatDuration(log.duration)}</p>
                            <p className="text-xs text-gray-500">Duration</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <Calendar className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                            <p className="text-sm font-bold text-gray-900">{format(new Date(log.createdAt), "MMM d")}</p>
                            <p className="text-xs text-gray-500">{format(new Date(log.createdAt), "h:mm a")}</p>
                        </div>
                    </div>



                    {/* AI Summary */}
                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">AI Summary</h4>
                        </div>
                        <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:font-semibold prose-strong:font-bold prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-4 prose-ul:my-2 prose-li:my-1">
                            {log.summary ? (
                                <ReactMarkdown>{log.summary}</ReactMarkdown>
                            ) : (
                                <p>No summary was generated for this call.</p>
                            )}
                        </div>
                    </div>

                    {/* Full Transcript */}
                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4 text-purple-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Conversation Transcript</h4>
                            </div>
                        </div>
                        <TranscriptDisplay transcript={log.transcript} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function CallLogsTable({ logs, onRefresh }: CallLogsTableProps) {
    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    // Apply filters
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesCaller = log.callerNumber?.toLowerCase().includes(query);
                const matchesSummary = log.summary?.toLowerCase().includes(query);
                if (!matchesCaller && !matchesSummary) return false;
            }

            // Date filter
            if (dateFilter !== "all") {
                const logDate = new Date(log.createdAt);
                if (dateFilter === "today" && !isToday(logDate)) return false;
                if (dateFilter === "week" && !isThisWeek(logDate)) return false;
                if (dateFilter === "month" && !isThisMonth(logDate)) return false;
            }

            return true;
        });
    }, [logs, searchQuery, dateFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * logsPerPage,
        currentPage * logsPerPage
    );

    // Reset to page 1 when filters change
    const handleFilterChange = (type: "search" | "status" | "date", value: string) => {
        setCurrentPage(1);
        if (type === "search") setSearchQuery(value);
        else if (type === "date") setDateFilter(value);
    };

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                    <Phone className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Calls Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    When your AI agent handles calls, they will appear here with full details.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters Bar */}
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 p-4 bg-gray-50 rounded-xl border">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto min-w-[200px]">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search caller or summary..."
                        value={searchQuery}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="border-0 bg-white shadow-sm w-full"
                    />
                </div>

                <div className="flex gap-3">
                    <Select value={dateFilter} onValueChange={(v) => handleFilterChange("date", v)}>
                        <SelectTrigger className="w-full sm:w-[140px] bg-white flex-1">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>

                    {onRefresh && (
                        <Button variant="outline" size="icon" onClick={onRefresh} className="shrink-0 bg-white shadow-sm">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                <span>
                    Showing {paginatedLogs.length} of {filteredLogs.length} calls
                    {filteredLogs.length !== logs.length && ` (filtered from ${logs.length})`}
                </span>
            </div>

            {/* Call Log Cards */}
            {paginatedLogs.length === 0 ? (
                <div className="text-center py-12">
                    <Search className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No calls match your filters.</p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setSearchQuery("");
                            setDateFilter("all");
                        }}
                    >
                        Clear filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginatedLogs.map((log) => (
                        <CallLogCard key={log.id} log={log} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    className="w-9 h-9"
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
