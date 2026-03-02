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

        const { areaCode, countryCode = "US", contains, locality, region } = await req.json();

        // Build search options for Twilio API
        const searchOptions: {
            areaCode?: number;
            contains?: string;
            inLocality?: string;
            inRegion?: string;
            limit: number;
        } = {
            limit: 100,
        };

        // Add filters only if provided
        if (areaCode) searchOptions.areaCode = parseInt(areaCode, 10);
        if (contains) searchOptions.contains = contains;
        if (locality) searchOptions.inLocality = locality;
        if (region) searchOptions.inRegion = region;

        // Fetch numbers with filtered options
        const availableNumbers = await twilioClient.availablePhoneNumbers(countryCode)
            .local
            .list(searchOptions);

        // Fetch real pricing for this country
        let price = "1.15";
        let currency = "USD";
        try {
            const pricing = await twilioClient.pricing.v1.phoneNumbers
                .countries(countryCode)
                .fetch();

            // Log for debugging
            console.log(`[PRICING] Detected for ${countryCode}: unit=${pricing.priceUnit}`);

            // Find best available price category
            const priceData = pricing.phoneNumberPrices.find(p => p.numberType === 'local') ||
                pricing.phoneNumberPrices.find(p => p.numberType === 'mobile') ||
                pricing.phoneNumberPrices.find(p => p.numberType === 'national') ||
                pricing.phoneNumberPrices[0];

            if (priceData?.currentPrice) {
                price = priceData.currentPrice.toString();
                currency = pricing.priceUnit.toUpperCase();
                console.log(`[PRICING] Using ${price} ${currency} for ${countryCode}`);
            }
        } catch (pricingError) {
            console.error("Error fetching Twilio pricing:", pricingError);
            // Default fallbacks
            if (countryCode === 'GB') price = "1.00";
            else if (countryCode === 'US') price = "1.15";
        }

        const numbers = availableNumbers.map((n) => ({
            phoneNumber: n.phoneNumber,
            friendlyName: n.friendlyName,
            isoCountry: n.isoCountry,
            locality: n.locality || n.region || countryCode,
            region: n.region || "",
            price: price,
            currency: currency
        }));

        console.log(`[TWILIO_SEARCH] Returned ${numbers.length} numbers for ${countryCode} at ${price} ${currency}`);
        return NextResponse.json(numbers);
    } catch (error) {
        console.error("[TWILIO_SEARCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
