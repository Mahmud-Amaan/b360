"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, User, Mail, Tag, Phone } from "lucide-react";

interface Booking {
    id: string;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    bookingDate: string | null;
    serviceDetails: string | null;
    status: string;
}

export function BookingRecords({ bookings }: { bookings: Booking[] }) {
    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No Bookings Yet</h3>
                <p className="text-gray-500 max-w-sm">
                    When customers book appointments via your AI agent, they will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                {booking.customerName || "No Name"}
                            </span>
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 uppercase">
                                {booking.status}
                            </span>
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <Calendar className="mr-2 h-4 w-4" />
                            {booking.bookingDate
                                ? format(new Date(booking.bookingDate), "MMM d, yyyy 'at' h:mm a")
                                : "Date TBD"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-4">
                        {booking.customerEmail && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                <a href={`mailto:${booking.customerEmail}`} className="text-indigo-600 hover:underline">
                                    {booking.customerEmail}
                                </a>
                            </div>
                        )}
                        {booking.customerPhone && (
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                <a href={`tel:${booking.customerPhone}`} className="text-indigo-600 hover:underline">
                                    {booking.customerPhone}
                                </a>
                            </div>
                        )}
                        {booking.serviceDetails && (
                            <div className="flex items-start text-sm text-gray-600 pt-3 border-t">
                                <Tag className="mr-2 h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="line-clamp-2">{booking.serviceDetails}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
