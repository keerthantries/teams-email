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
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\n${message}`,
      replyTo: email,
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `We’ve Received Your Message!`,
      html: `<p>Hi ${name},<br>Thanks for contacting us. We'll get back to you soon!</p>`,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
