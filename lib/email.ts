import { Resend } from 'resend';

// Provide a dummy key for build-time safety if env is missing
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

// Helper to get the sender address
// When using Resend without a verified domain, you MUST use onboarding@resend.dev
// or emails will fail silently for external recipients.
const getSender = (name: string) => {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  return `${name} <${fromEmail}>`;
};

/**
 * Send verification code email with retry logic
 */
export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const MAX_RETRIES = 3;
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: getSender('HumanDefi'),
        to: email,
        subject: 'Your HumanDefi Verification Code',
        replyTo: 'support@WhaleAlert ID.fi',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5dc;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #000000;">Human<span style="color: #2563eb;">ID</span></h1>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #666666;">Decentralized Identity Protocol</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 20px 40px;">
                        <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">Verification Code</h2>
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.5;">
                          Your verification code is:
                        </p>
                        <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
                          <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace;">
                            ${code}
                          </div>
                        </div>
                        <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
                          This code will expire in <strong>5 minutes</strong>. If you didn't request this code, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 20px 40px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 12px; color: #999999;">
                          © ${new Date().getFullYear()} WhaleAlert ID.fi. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`[Email]  Verification code sent to ${email} (attempt ${attempt})`, data ? { id: data.id } : {});
      return; // Success!
      
    } catch (error: any) {
      lastError = error;
      console.error(`[Email]  Attempt ${attempt}/${MAX_RETRIES} failed for ${email}:`, {
        message: error?.message || error,
        name: error?.name,
        code: error?.code
      });
      
      // Stop on specific fatal errors
      if (error?.message?.includes('Invalid') || error?.message?.includes('not found') || error?.statusCode === 422) {
        throw error;
      }
      
      if (attempt < MAX_RETRIES) {
        const backoffMs = 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  
  throw lastError;
}

/**
 * Send welcome email to new subscribers
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: getSender('Whale Alert Network'),
      to: email,
      subject: 'WELCOME TO THE WHALE ALERT NETWORK // SENSORS INITIALIZED',
      replyTo: 'support@whalealertid.fi',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Martel:wght@900&family=Roboto+Mono:wght@400;700&display=swap');
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #F2ECD8; color: #1D1A10;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F2ECD8;">
            <tr>
              <td align="center" style="padding: 60px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; border: 2px solid #1D1A10; background-color: #F2ECD8; box-shadow: 20px 20px 0px #1D1A10;">
                  <!-- Brand Identity -->
                  <tr>
                    <td style="padding: 60px 60px 40px; border-bottom: 2px solid #1D1A10;">
                      <div style="font-family: 'Roboto Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5em; margin-bottom: 20px; opacity: 0.4;">
                        Institutional Access Protocol // Node Initialized
                      </div>
                      <h1 style="font-family: 'Martel', serif; font-size: 48px; font-weight: 900; text-transform: uppercase; line-height: 0.9; margin: 0; letter-spacing: -2px;">
                        WHALE <br/><span style="font-style: italic; color: #D125C7;">ALERT</span>
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Transmission Content -->
                  <tr>
                    <td style="padding: 60px;">
                      <h2 style="font-family: 'Martel', serif; font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0 0 30px;">
                        Welcome to <span style="font-style: italic;">Whale Alert Network</span>.
                      </h2>
                      
                      <p style="font-size: 16px; line-height: 1.8; margin-bottom: 30px; font-weight: 500;">
                        You have been successfully integrated into the most advanced on-chain analytics stream on the planet. Your terminal has been validated, and you are now part of the elite monitoring the system liquidity of the decentralized financial system.
                      </p>

                      <div style="background-color: #1D1A10; color: #B6EA26; padding: 30px; font-family: 'Roboto Mono', monospace; font-size: 12px; margin-bottom: 40px; border-left: 4px solid #D125C7;">
                        <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(182, 234, 38, 0.2); padding-bottom: 15px;">
                          STATUS: PRE-LAUNCH PREPARATION // CODE: ARCHANGEL
                        </div>
                        <p style="margin: 0; line-height: 1.6;">
                          Our engineering team is finalizing the total immersion of the sensors. We are peering directly with L1 and L2 validators in Frankfurt and New York to ensure you receive mempool telemetry in under 14ms. <br/><br/>
                          The final phase of the "Archive Doctrine" has commenced. We are debugging every micrometer of code so that your interface with the network is outrageously legendary.
                        </p>
                      </div>

                      <p style="font-size: 14px; line-height: 1.6; color: rgba(29, 26, 16, 0.6); margin-bottom: 40px;">
                        You will soon receive access credentials for the Forensic Stream V1. Prepare for absolute data systemty.
                      </p>

                      <!-- Action CTA -->
                      <div style="text-align: left;">
                        <a href="https://whalealertid.fi" style="display: inline-block; background-color: #1D1A10; color: #F2ECD8; padding: 20px 40px; font-family: 'Roboto Mono', monospace; font-weight: 900; text-decoration: none; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em;">
                          ACCESS NETWORK >
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Corporate Footer -->
                  <tr>
                    <td style="padding: 40px 60px; background-color: #1D1A10; color: #F2ECD8; font-family: 'Roboto Mono', monospace;">
                      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.5; margin-bottom: 10px;">
                        Whale Alert Corporation // All Rights Reserved © 2026
                      </div>
                      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.3;">
                        Confidential Transmission // Institutional Eyes Only
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

/**
 * Send support message to admin
 */
export async function sendSupportEmail(message: string, section: string, senderEmail?: string, senderName?: string): Promise<void> {
  const adminEmail = 'josejordan20222@gmail.com';
  
  try {
    const { data, error } = await resend.emails.send({
      // The 'from' address MUST be your verified domain or onboarding@resend.dev
      from: getSender('WhaleAlert ID Support Form'),
      to: adminEmail,
      replyTo: senderEmail || 'noreply@WhaleAlert ID.fi',
      subject: `[Support - ${section.toUpperCase()}] New Message from ${senderName || 'Anonymous'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
            .message { background: #f9f9f9; padding: 20px; border-left: 4px solid #333; font-size: 1.1em; white-space: pre-wrap; }
            .footer { margin-top: 30px; font-size: 0.8em; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Support Message</h2>
            </div>
            
            <div class="meta">
              <p><strong>Category:</strong> ${section.toUpperCase()}</p>
              <p><strong>Name:</strong> ${senderName || 'Anonymous User'}</p>
              <p><strong>From:</strong> ${senderEmail || 'Anonymous User'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div class="message">
              ${message}
            </div>

            <div class="footer">
              <p>Sent via HumanDefi Support Interface</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
     if (error) throw error;
    
    console.log(`[Email] Support message forwarded to ${adminEmail}`, data ? { id: data.id } : {});
    
  } catch (error: any) {
    console.error(`[Email] Failed to forward support message:`, error?.message || error);
    throw new Error(`Support email failed: ${error?.message || 'Unknown error'}`);
  }
}

