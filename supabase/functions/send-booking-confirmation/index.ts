import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId, guestEmail, guestName, startTime, endTime, ownerEmail, ownerName } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Format the date and time
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    const dateStr = startDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeStr = `${startDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    })}`

    // Email template for guest
    const guestEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Meeting Confirmation</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563EB; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .meeting-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563EB; }
            .button { display: inline-block; background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Meeting Confirmed!</h1>
              <p>Your meeting has been successfully scheduled</p>
            </div>
            <div class="content">
              <p>Hi ${guestName},</p>
              <p>Great news! Your meeting with <strong>${ownerName}</strong> has been confirmed.</p>
              
              <div class="meeting-details">
                <h3>📅 Meeting Details</h3>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${timeStr}</p>
                <p><strong>Duration:</strong> 30 minutes</p>
                <p><strong>Meeting ID:</strong> ${bookingId}</p>
              </div>

              <p>We'll send you a reminder 24 hours before your meeting. If you need to reschedule or cancel, please contact us as soon as possible.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="button">Add to Calendar</a>
              </div>

              <p>Looking forward to meeting with you!</p>
              <p>Best regards,<br>${ownerName}</p>
            </div>
            <div class="footer">
              <p>This is an automated message from your scheduling system.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Email template for owner
    const ownerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Booking Notification</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Booking</h1>
              <p>You have a new meeting scheduled</p>
            </div>
            <div class="content">
              <p>Hi ${ownerName},</p>
              <p>You have a new booking from <strong>${guestName}</strong>.</p>
              
              <div class="booking-details">
                <h3>📅 Booking Details</h3>
                <p><strong>Guest:</strong> ${guestName}</p>
                <p><strong>Email:</strong> ${guestEmail}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
                <p><strong>Time:</strong> ${timeStr}</p>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
              </div>

              <p>The guest has been automatically notified with a confirmation email.</p>
              <p>You can manage this booking from your dashboard.</p>
            </div>
            <div class="footer">
              <p>This is an automated notification from your scheduling system.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send confirmation email to guest
    const guestEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Scheduler <noreply@yourdomain.com>',
        to: [guestEmail],
        subject: `Meeting Confirmed - ${dateStr} at ${timeStr.split(' - ')[0]}`,
        html: guestEmailHtml,
      }),
    })

    // Send notification email to owner
    const ownerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Scheduler <noreply@yourdomain.com>',
        to: [ownerEmail],
        subject: `New Booking: ${guestName} - ${dateStr}`,
        html: ownerEmailHtml,
      }),
    })

    const guestResult = await guestEmailResponse.json()
    const ownerResult = await ownerEmailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        guestEmailId: guestResult.id,
        ownerEmailId: ownerResult.id,
        message: 'Confirmation emails sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending emails:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})