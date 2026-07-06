import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Server-side validation
    if (!data.name || !data.email || !data.company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // =========================================================================
    // CRM & EMAIL INTEGRATION POINT (RESEND)
    // =========================================================================
    if (process.env.RESEND_API_KEY) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'onboarding@resend.dev', // Default testing domain for Resend
        to: 'josejordan20222@gmail.com', // Your email from the screenshot
        subject: `New Pilot Request: ${data.company}`,
        text: `New Lead Captured!\n\nName: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company}\nInterest: ${data.interest}`,
      });
      console.log('✅ B2B LEAD CAPTURED & EMAIL SENT:', data.company);
    } else {
      console.warn('⚠️ RESEND_API_KEY missing. Lead logged to console only:', data);
    }
    // =========================================================================
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: 'Lead captured successfully' });
  } catch (error: any) {
    console.error('Lead Capture Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
