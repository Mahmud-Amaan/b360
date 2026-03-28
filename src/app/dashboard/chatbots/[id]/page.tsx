"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatbotsStore } from "@/store/useChatbotsStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Copy, Edit } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Custom hook to get the correct base URL
function useBaseUrl() {
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Check if we're in production (Vercel)
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;

      if (hostname === "b360-one.vercel.app") {
        setBaseUrl("https://b360-one.vercel.app");
      } else {
        // For other domains, use the current domain
        setBaseUrl(`${window.location.protocol}//${window.location.host}`);
      }
    }
  }, []);

  return baseUrl;
}

export default function ChatbotViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { chatbots, isLoading, fetchChatbots } = useChatbotsStore();

  const [chatbotId, setChatbotId] = useState<string>("");
  const baseUrl = useBaseUrl();
  const code = useMemo(() => {
    const chatbotJSFile = baseUrl.includes("vercel")
      ? "chatbot.js"
      : "chatbot-dev.js";
    return `<script src="${baseUrl}/${chatbotJSFile}" data-chatbot-id="${chatbotId}" defer></script>`;
  }, [chatbotId, baseUrl]);

  useEffect(() => {
    fetchChatbots();
  }, [fetchChatbots]);

  useEffect(() => {
    params.then((resolvedParams) => {
      setChatbotId(resolvedParams.id);
    });
  }, [params]);

  const handleCopyCode = async () => {
    if (!chatbotId || !baseUrl) return;
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Embed code copied to clipboard");
    } catch {
      toast.error("Failed to copy embed code");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load your chatbot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading chatbot data...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chatbot = chatbots.find((w) => w.id === chatbotId);
  if (!chatbot && chatbotId) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chatbot Not Found</CardTitle>
            <CardDescription>
              The requested chatbot could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/chatbots")}>
              Back to Chatbots
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!chatbot) {
    return null; // Still loading
  }

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
          <p className="text-gray-600 mt-1">
            Manage your chatbot configuration and view analytics
          </p>
          <div className="flex items-center space-x-4 mt-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${chatbot.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
                }`}
            >
              {chatbot.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href={`/dashboard/chatbots/${chatbot.id}/edit`} className="w-full sm:w-auto">
            <Button className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
              <Edit className="mr-2 h-4 w-4" />
              Edit Configuration
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Integration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center">
              🚀 Integrate Your AI Chatbot
            </CardTitle>
            <CardDescription className="text-lg">
              Get your AI-powered customer support chatbot live in minutes with our simple integration guide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Step-by-step instructions in a row layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Copy the Code</h4>
                  <p className="text-gray-600">Copy the integration snippet below.</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Paste in Your Website</h4>
                  <p className="text-gray-600">Add the code to your website&apos;s &lt;head&gt; or before closing &lt;/body&gt; tag.</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Go Live!</h4>
                  <p className="text-gray-600">Your AI chatbot will appear automatically and start helping customers.</p>
                </div>
              </div>
            </div>

            {/* Code snippet - centered and larger */}
            <div className="space-y-4 max-w-4xl mx-auto">
              <h4 className="font-semibold text-gray-900 text-lg text-center">Integration Code:</h4>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg text-base font-mono overflow-x-auto">
                <code>{code}</code>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={handleCopyCode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-lg py-3 px-8"
                >
                  <Copy className="mr-2 h-5 w-5" />
                  Copy Integration Code
                </Button>
              </div>
            </div>

            {/* Platform guides and features in a 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Platform-specific instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-4 text-lg">📚 Platform-Specific Guides:</h4>
                <div className="space-y-2">
                  <div className="text-blue-700">• <strong>WordPress:</strong> Add to footer.php</div>
                  <div className="text-blue-700">• <strong>Shopify:</strong> Add to theme.liquid</div>
                  <div className="text-blue-700">• <strong>React:</strong> Import in App.js</div>
                  <div className="text-blue-700">• <strong>HTML:</strong> Add before &lt;/body&gt;</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
