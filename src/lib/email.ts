import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingDetails {
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  bookingDate: Date | string | null;
  serviceDetails: string | null;
  agentName: string;
}

export async function sendBookingNotification(
  adminEmail: string,
  booking: BookingDetails
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  const bookingDateFormatted = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    : "To be confirmed";

  const fromEmail = process.env.RESEND_FROM_EMAIL || "B360 <noreply@resend.dev>";

  try {
    // Send to admin
    const { error: adminError } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New Lead: ${booking.customerName || "Customer"} booked an appointment`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px !important; }
      .content { padding: 16px !important; }
      .row { display: block !important; border-bottom: 1px solid #f1f5f9; padding: 12px 0 !important; }
      .label { display: block !important; width: 100% !important; margin-bottom: 4px !important; font-weight: 600 !important; color: #64748b !important; }
      .value { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="font-family: sans-serif; background: #f4f7fa; padding: 0; margin: 0;">
  <div class="container" style="padding: 40px; width: 100%; box-sizing: border-box;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="background: #1e293b; padding: 24px 20px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 20px; font-weight: 600;">🔔 New Booking Lead</h2>
      </div>
      <div class="content" style="padding: 32px;">
        <p style="margin-top: 0; color: #334155; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
          You have received a new booking via <strong style="color: #0f172a;">${booking.agentName}</strong>.
        </p>
        
        <div style="border-top: 1px solid #e2e8f0;">
          <div class="row" style="display: flex; border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
            <div class="label" style="flex: 0 0 35%; color: #64748b; font-size: 14px;">Customer Name</div>
            <div class="value" style="color: #0f172a; font-weight: 500; font-size: 14px;">${booking.customerName || "Not provided"}</div>
          </div>
          
          <div class="row" style="display: flex; border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
            <div class="label" style="flex: 0 0 35%; color: #64748b; font-size: 14px;">Email</div>
            <div class="value" style="color: #0f172a; font-weight: 500; font-size: 14px; word-break: break-all;">${booking.customerEmail || "Not provided"}</div>
          </div>
          
          <div class="row" style="display: flex; border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
            <div class="label" style="flex: 0 0 35%; color: #64748b; font-size: 14px;">Phone</div>
            <div class="value" style="color: #0f172a; font-weight: 500; font-size: 14px;">${booking.customerPhone || "Not provided"}</div>
          </div>

          <div class="row" style="display: flex; border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
            <div class="label" style="flex: 0 0 35%; color: #64748b; font-size: 14px;">Appointment</div>
            <div class="value" style="color: #2563eb; font-weight: 600; font-size: 14px;">${bookingDateFormatted}</div>
          </div>

          <div class="row" style="display: flex; border-bottom: 1px solid #f1f5f9; padding: 12px 0;">
            <div class="label" style="flex: 0 0 35%; color: #64748b; font-size: 14px;">Service/Notes</div>
            <div class="value" style="color: #0f172a; font-size: 14px; line-height: 1.5;">${booking.serviceDetails || "None"}</div>
          </div>
        </div>

        <div style="margin-top: 32px; text-align: center;">
          <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">View in Dashboard</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
    });

    if (adminError) {
      console.error("Resend admin email error:", adminError);
    }

    // Send confirmation to customer if email provided
    if (booking.customerEmail) {
      const { error: customerError } = await resend.emails.send({
        from: fromEmail,
        to: booking.customerEmail,
        subject: `Appointment Confirmed: ${bookingDateFormatted}`,
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #ffffff; padding: 40px;">
  <div style="max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <div style="padding: 24px; text-align: center; border-bottom: 1px solid #f3f4f6;">
      <h1 style="color: #059669; margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
      <p style="color: #6b7280; margin: 8px 0 0;">with ${booking.agentName}</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi ${booking.customerName || "there"},</p>
      <p style="color: #4b5563; line-height: 1.5;">Your appointment has been successfully scheduled. We look forward to seeing you!</p>
      
      <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <div style="font-size: 14px; color: #166534; margin-bottom: 4px;">WHEN</div>
        <div style="font-size: 18px; font-weight: 600; color: #14532d;">${bookingDateFormatted}</div>
        
        ${booking.serviceDetails ? `
        <div style="margin-top: 16px;">
          <div style="font-size: 14px; color: #166534; margin-bottom: 4px;">WHAT</div>
          <div style="font-size: 16px; color: #14532d;">${booking.serviceDetails}</div>
        </div>` : ""}
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        Need to make changes? Please reply to this email or call us.
      </p>
    </div>
    
    <div style="background: #f9fafb; padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
      &copy; ${new Date().getFullYear()} ${booking.agentName}. All rights reserved.
    </div>
  </div>
</body>
</html>`,
      });

      if (customerError) {
        console.error("Resend customer email error:", customerError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send booking notification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
