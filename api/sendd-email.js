import nodemailer from 'nodemailer';

export default async function handler(req, res) {
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

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: `Contact from ${name}`,
      replyTo: email,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Contact Form Submission</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          max-width: 600px;
          margin: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        h2 {
          color: #333333;
        }
        .info {
          margin: 20px 0;
          line-height: 1.6;
          color: #555555;
        }
        .label {
          font-weight: bold;
          color: #222222;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9em;
          color: #888888;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📬 New Contact Form Submission</h2>
        <div class="info">
          <p><span class="label">Name:</span> ${name}</p>
          <p><span class="label">Email:</span> ${email}</p>
          <p><span class="label">Phone:</span> ${phone || 'N/A'}</p>
          <p><span class="label">Company:</span> ${company || 'N/A'}</p>
          <p><span class="label">Subject:</span> ${subject || 'General Inquiry'}</p>
          <p><span class="label">Message:</span><br>${message}</p>
        </div>
        <div class="footer">
          Submitted on ${timestamp}<br>
          — ${websiteName} Team
        </div>
      </div>
    </body>
    </html>
  `
    });


    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `We’ve Received Your Message!`,
      html: `<div style="width:100%;background:#f5f5f5;padding:0;margin:0;">
  <div style="max-width:650px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;
              font-family:Poppins,Arial,sans-serif;font-size:16px;line-height:1.6;color:#333;">

    <!-- Header with Logo and Text -->
    <div style="    background: linear-gradient(359deg, #1976d2c2 15%, #26c6da 94%);
    filter: brightness(1.1);color:#ffffff;text-align:center;padding:1.8em;">
      <img src="https://i.ibb.co/tpP9hVh1/logo-removebg-preview.png" alt="VSaaS Logo" 
           style="height:50px;max-width:100%;margin-bottom:10px;filter: drop-shadow(-0px 1px 3px #6fb5d9);">

      
      <h4 style="margin:0;font-weight:400;font-size:1.1em;letter-spacing:1px;">
        Thank You for Reaching Out
      </h4>
      <h1 style="margin:0.3em 0 0;font-weight:600;font-size:1.8em;line-height:1.3;">
        We’ve <span style="color:#ffeb3b;">Received</span> Your Message!
      </h1>
    </div>

    <!-- Main Content -->
    <div style="padding:1.5em;">
      <p style="margin-top:0;">Hi {{name}},</p>
      <p>
        Thank you for contacting <strong>VSaaS Technologies</strong>.<br>
        We’ve successfully received your inquiry and our team is reviewing your request.<br>
        One of our representatives will get back to you within <strong>2 business days</strong>.
      </p>

      <!-- Why Choose Us Section -->
      <div style="margin:25px 0;padding:15px;background:#f9fbfc;border-left:4px solid #1976d2;border-radius:6px;">
        <h3 style="margin-top:0;color:#1976d2;font-size:1.2em;">Why Choose VSaaS Technologies?</h3>
        <ul style="padding-left:20px;margin:10px 0;">
          <li>✔ Cutting-edge Development solutions for modern businesses</li>
          <li>✔ Proven reliability and scalability trusted by top clients</li>
          <li>✔ Vast range of services offered for all round IT and business needs </li>
          <li>✔ Dedicated support and fast response times</li>

        </ul>
      </div>

      <p>Meanwhile, feel free to explore our website for more information about our services:</p>
      <p style="text-align:center;margin:25px 0;">
        <a href="https://vsaastechnologies.com" target="_blank"
           style="display:inline-block;background:#1976d2;color:#ffffff;text-decoration:none;
                  padding:12px 24px;border-radius:24px;font-weight:bold;">
          Visit Our Website
        </a>
      </p>

      <hr style="margin:2em 0;border:none;height:2px;background:linear-gradient(90deg,#1976d2,#26c6da);border-radius:2px;">
      <p style="margin-bottom:0;">Best regards,</p>
      <p style="font-family:'Dancing Script',cursive;font-size:1.8em;color:#1976d2;margin:0;">
        The VSaas Team
      </p>
      <p style="margin-top:4px;"><em>Customer Support</em><br>VSaas Technologies</p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f3f6;text-align:center;padding:1em;font-size:0.9em;color:#777;">
      &copy; 2025 VSaas Technologies. All rights reserved.
    </div>
  </div>
</div>
`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
