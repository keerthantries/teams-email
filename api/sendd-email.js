const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  // Log which environment variables are loaded
  const envCheck = {
    EMAIL_USER: !!process.env.EMAIL_USER,
    CLIENT_ID: !!process.env.CLIENT_ID,
    CLIENT_SECRET: !!process.env.CLIENT_SECRET,
    REFRESH_TOKEN: !!process.env.REFRESH_TOKEN,
    ACCESS_TOKEN: !!process.env.ACCESS_TOKEN
  };
  console.log('SMTP ENV CHECK:', envCheck);

  // If any env variable is missing, return early
  if (Object.values(envCheck).includes(false)) {
    return res.status(500).json({
      success: false,
      message: 'Missing SMTP credentials',
      details: envCheck
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'revanth@vsaastechnologies.com',
      subject: `New Contact Form Submission from ${name}`,
      text: `Email: ${email}\n\nMessage:\n${message}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Email error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    res.status(500).json({
      success: false,
      message: 'Email configuration error',
      error: {
        message: error.message,
        code: error.code,
        name: error.name
      }
    });
  }
}
