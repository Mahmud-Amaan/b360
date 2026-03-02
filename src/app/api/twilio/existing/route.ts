import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        const phoneSid = process.env.TWILIO_PHONE_SID || "existing-trial";

        if (!phoneNumber) {
            return new NextResponse("No existing number configured", { status: 404 });
        }

        return NextResponse.json({ phoneNumber, sid: phoneSid });
    } catch (error) {
        console.error("[TWILIO_EXISTING]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
