import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or use 'http://127.0.0.1:5501' for stricter control
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.TO_EMAIL) {
    console.error('Missing SMTP credentials');
    return res.status(500).json({ error: 'Email configuration error' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subject = `Contact from ${name}`;
    const timestamp = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    });

    // Admin Notification
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject,
      replyTo: email,
      html: `
        <div style="font-family:Segoe UI,sans-serif;background:#f4f6f8;padding:20px;">
          <div style="background:#fff;border-radius:8px;padding:30px;max-width:600px;margin:auto;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="color:#333;">📬 New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong><br>${message}</p>
            <hr>
            <p style="font-size:0.9em;color:#888;">Submitted on ${timestamp}<br>— VSaaS Technologies Team</p>
          </div>
        </div>
      `
    });

    // Auto-reply to user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `We’ve Received Your Message!`,
      html: `
        <div style="width:100%;background:#f5f5f5;padding:0;margin:0;">
          <div style="max-width:650px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;
                      font-family:Poppins,Arial,sans-serif;font-size:16px;line-height:1.6;color:#333;">
            <div style="background:linear-gradient(359deg,#1976d2c2 15%,#26c6da 94%);
                        color:#fff;text-align:center;padding:1.8em;">
              <img src="https://i.ibb.co/tpP9hVh1/logo-removebg-preview.png" alt="VSaaS Logo"
                   style="height:50px;margin-bottom:10px;">
              <h4 style="margin:0;font-weight:400;font-size:1.1em;">Thank You for Reaching Out</h4>
              <h1 style="margin:0.3em 0 0;font-weight:600;font-size:1.8em;">We’ve <span style="color:#ffeb3b;">Received</span> Your Message!</h1>
            </div>
            <div style="padding:1.5em;">
              <p>Hi ${name},</p>
              <p>Thank you for contacting <strong>VSaaS Technologies</strong>.<br>
              We’ve successfully received your inquiry and our team is reviewing your request.<br>
              One of our representatives will get back to you within <strong>2 business days</strong>.</p>
              <div style="margin:25px 0;padding:15px;background:#f9fbfc;border-left:4px solid #1976d2;border-radius:6px;">
                <h3 style="margin-top:0;color:#1976d2;">Why Choose VSaaS Technologies?</h3>
                <ul style="padding-left:20px;">
                  <li>✔ Cutting-edge Development solutions</li>
                  <li>✔ Proven reliability and scalability</li>
                  <li>✔ All-round IT and business services</li>
                  <li>✔ Dedicated support and fast response</li>
                </ul>
              </div>
              <p style="text-align:center;">
                <a href="https://vsaastechnologies.com" target="_blank"
                   style="background:#1976d2;color:#fff;text-decoration:none;
                          padding:12px 24px;border-radius:24px;font-weight:bold;">
                  Visit Our Website
                </a>
              </p>
              <hr style="margin:2em 0;border:none;height:2px;background:linear-gradient(90deg,#1976d2,#26c6da);">
              <p>Best regards,</p>
              <p style="font-family:'Dancing Script',cursive;font-size:1.8em;color:#1976d2;margin:0;">The VSaaS Team</p>
              <p><em>Customer Support</em><br>VSaaS Technologies</p>
            </div>
            <div style="background:#f1f3f6;text-align:center;padding:1em;font-size:0.9em;color:#777;">
              &copy; 2025 VSaaS Technologies. All rights reserved.
            </div>
          </div>
        </div>
      `
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
