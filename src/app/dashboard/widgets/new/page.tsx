"use client";

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
import { useWidgetsStore } from "@/store/useWidgetsStore";
import { IconSelector } from "@/components/dashboard/IconSelector";

export default function NewWidgetPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createWidget } = useWidgetsStore();

  const [formData, setFormData] = useState({
    name: "",
    position: "bottom-right" as const,
    primaryColor: "#6366F1",
    productName: "",
    description: "",
    widgetTitle: "Chat with us",
    welcomeMessage: "Hi! How can I help you today?",
    isActive: true,
    iconType: "default" as const,
    iconEmoji: "",
    customIcon: "",
    adminEmail: "",
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Widget name is required");
      return;
    }
    if (!formData.productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API
      const widgetData = {
        name: formData.name.trim(),
        position: formData.position,
        primaryColor: formData.primaryColor,
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        widgetTitle: formData.widgetTitle.trim(),
        welcomeMessage: formData.welcomeMessage.trim(),
        isActive: formData.isActive,
        iconType: formData.iconType,
        iconEmoji: formData.iconEmoji,
        customIcon: formData.customIcon,
        adminEmail: formData.adminEmail?.trim() || undefined,
      };

      const widget = await createWidget(widgetData);

      router.push(`/dashboard/widgets/${widget.id}`);
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create widget"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Widget
              </CardTitle>
              <CardDescription>
                Build a beautiful support widget for your website
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
                        <Label htmlFor="name">Widget Name</Label>
                        <Input
                          id="name"
                          placeholder="My Support Widget"
                          value={formData.name}
                          onChange={(e) =>
                            updateFormData("name", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Select
                          value={formData.position}
                          onValueChange={(value) =>
                            updateFormData("position", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">
                              Bottom Right
                            </SelectItem>
                            <SelectItem value="bottom-left">
                              Bottom Left
                            </SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-left">Top Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) =>
                            updateFormData("primaryColor", e.target.value)
                          }
                          className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) =>
                            updateFormData("primaryColor", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Product Details
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        placeholder="Your Amazing Product"
                        value={formData.productName}
                        onChange={(e) =>
                          updateFormData("productName", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your product or service..."
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData("description", e.target.value)
                        }
                        className="min-h-20"
                        required
                      />
                    </div>
                  </div>

                  {/* Widget Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Widget Configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Notification Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          placeholder="admin@example.com"
                          value={formData.adminEmail}
                          onChange={(e) =>
                            updateFormData("adminEmail", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="widgetTitle">Widget Title</Label>
                        <Input
                          id="widgetTitle"
                          placeholder="Need Help?"
                          value={formData.widgetTitle}
                          onChange={(e) =>
                            updateFormData("widgetTitle", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Input
                          id="welcomeMessage"
                          placeholder="How can we help you today?"
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
                      <Label htmlFor="isActive">Widget Active</Label>
                    </div>
                  </div>

                  {/* Widget Icon */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Widget Icon
                    </h3>
                    <IconSelector
                      iconType={formData.iconType}
                      iconEmoji={formData.iconEmoji}
                      customIcon={formData.customIcon}
                      onIconTypeChange={(type) => updateFormData("iconType", type)}
                      onEmojiChange={(emoji) => updateFormData("iconEmoji", emoji)}
                      onCustomIconChange={(url) => updateFormData("customIcon", url)}
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/widgets")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? "Creating..." : "Create Widget"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
