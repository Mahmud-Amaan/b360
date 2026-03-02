"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useWidgetsStore } from "@/store/useWidgetsStore";
import {
  widgetFormSchema,
  type WidgetFormValues,
} from "@/lib/validations/widget";
import { IconSelector } from "@/components/dashboard/IconSelector";

export default function EditWidgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { widgets, isLoading, fetchWidgets, updateWidget } = useWidgetsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetId, setWidgetId] = useState<string>("");
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const form = useForm<any>({
    // resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      name: "",
      position: "bottom-right",
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
    },
  });

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setWidgetId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (widgetId && widgets.length > 0) {
      const widget = widgets.find((w) => w.id === widgetId);
      if (widget) {
        form.reset({
          name: widget.name,
          position: widget.position,
          primaryColor: widget.primaryColor,
          productName: widget.productName,
          description: widget.description,
          widgetTitle: widget.widgetTitle || "Chat with us",
          welcomeMessage:
            widget.welcomeMessage || "Hi! How can I help you today?",
          isActive: widget.isActive,
          customIcon: widget.customIcon,
          iconType: ((widget as any).iconType || "default") as "default" | "emoji" | "image",
          iconEmoji: (widget as any).iconEmoji || "",
          adminEmail: (widget as any).adminEmail || "",
        });
        if (widget.customIcon) {
          setIconPreview(widget.customIcon);
        }
      }
    }
  }, [widgets, widgetId, form]);

  const onSubmit = async (data: WidgetFormValues) => {
    if (!widgetId) return;
    try {
      setIsSubmitting(true);
      const updatedData = { ...data };

      if (iconPreview && iconPreview.startsWith('data:image')) {
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: iconPreview }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload icon');
        }

        const { url } = await response.json();
        updatedData.customIcon = url;
      }

      await updateWidget(widgetId, updatedData);
      toast.success("Widget updated successfully");
      router.push(`/dashboard/widgets/${widgetId}`);
    } catch {
      toast.error("Failed to update widget");
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 gap-8">
        {/* Form Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Edit Widget</CardTitle>
              <CardDescription>
                Update your widget configuration and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Settings</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Widget Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="My Support Widget"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.name?.message)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        {...form.register("productName")}
                        placeholder="Your Product Name"
                      />
                      {form.formState.errors.productName && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.productName?.message)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Describe your product or service..."
                        rows={3}
                      />
                      {form.formState.errors.description && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.description?.message)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Appearance</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select
                        value={form.watch("position")}
                        onValueChange={(value) =>
                          form.setValue(
                            "position",
                            value as
                            | "bottom-right"
                            | "bottom-left"
                            | "top-right"
                            | "top-left"
                          )
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

                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        {...form.register("primaryColor")}
                        className="h-10"
                      />
                      {form.formState.errors.primaryColor && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.primaryColor?.message)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customIcon">Custom Icon</Label>
                      <Input
                        id="customIcon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setIconPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {iconPreview && (
                        <div className="mt-2">
                          <img src={iconPreview} alt="Icon Preview" className="h-16 w-16 rounded-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Widget Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Widget Configuration
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Notification Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        {...form.register("adminEmail")}
                        placeholder="admin@example.com"
                      />
                      {form.formState.errors.adminEmail && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.adminEmail?.message)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="widgetTitle">Widget Title</Label>
                      <Input
                        id="widgetTitle"
                        {...form.register("widgetTitle")}
                        placeholder="Need Help?"
                      />
                      {form.formState.errors.widgetTitle && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.widgetTitle?.message)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="welcomeMessage">Welcome Message</Label>
                      <Textarea
                        id="welcomeMessage"
                        {...form.register("welcomeMessage")}
                        placeholder="How can we help you today?"
                        rows={2}
                      />
                      {form.formState.errors.welcomeMessage && (
                        <p className="text-sm text-red-500">
                          {String(form.formState.errors.welcomeMessage?.message)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        {...form.register("isActive")}
                        className="rounded"
                      />
                      <Label htmlFor="isActive">Widget Active</Label>
                    </div>
                  </div>

                  {/* Widget Icon */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Widget Icon</h3>
                    <IconSelector
                      iconType={form.watch("iconType") || "default"}
                      iconEmoji={form.watch("iconEmoji") || ""}
                      customIcon={form.watch("customIcon") || ""}
                      onIconTypeChange={(type) => form.setValue("iconType", type)}
                      onEmojiChange={(emoji) => form.setValue("iconEmoji", emoji)}
                      onCustomIconChange={(url) => {
                        form.setValue("customIcon", url);
                        setIconPreview(url);
                      }}
                    />
                  </div>
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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
