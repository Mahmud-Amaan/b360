import { NextResponse } from "next/server";
import { twilioClient } from "@/lib/twilio";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return new NextResponse("Phone number is required", { status: 400 });
        }

        // Purchase the number
        // Note: voiceUrl must be a public URL. Skip for localhost.
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        const isLocalhost = appUrl.includes("localhost") || appUrl.includes("127.0.0.1");

        const purchasedNumber = await twilioClient.incomingPhoneNumbers.create({
            phoneNumber,
            ...(isLocalhost ? {} : { voiceUrl: `${appUrl}/api/twilio/inbound` }),
        });

        return NextResponse.json({
            phoneNumber: purchasedNumber.phoneNumber,
            sid: purchasedNumber.sid,
        });
    } catch (error) {
        console.error("[TWILIO_BUY]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
