"use client";

import { useEffect } from "react";
import { useWidgetsStore } from "@/store/useWidgetsStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MessageSquare, Settings, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function WidgetsPage() {
  const { widgets, isLoading, fetchWidgets } = useWidgetsStore();

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[100px] w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Widgets</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer support widgets and view their performance
          </p>
        </div>
        <Link href="/dashboard/widgets/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Widget
          </Button>
        </Link>
      </div>

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No widgets yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first widget to start engaging with your customers
          </p>
          <Link href="/dashboard/widgets/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Widget
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {widget.name}
                  </CardTitle>
                  <Badge
                    variant={widget.isActive ? "default" : "secondary"}
                    className={
                      widget.isActive ? "bg-green-100 text-green-800" : ""
                    }
                  >
                    {widget.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  Created {new Date(widget.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-3">
                <div className="space-y-3">
                  {/* Product Info */}
                  <p className="text-md text-gray-600 truncate">
                    <span className="font-medium">Product:</span>{" "}
                    {widget.productName}
                  </p>

                  {/* Color Preview */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: widget.primaryColor }}
                      />
                      <span className="text-xs text-gray-500">
                        Primary Color
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-gray-100">
                <div className="flex w-full gap-2">
                  <Link href={`/dashboard/widgets/${widget.id}`}>
                    <Button size="sm" className="w-full">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/widgets/${widget.id}/edit`}>
                    <Button size="sm">
                      <span className="mr-2 ">Edit</span>
                      <Settings className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
