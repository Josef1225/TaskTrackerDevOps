const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5001;

/* =========================
   Email Transporter
========================= */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

/* =========================
   Manual Email Endpoint
========================= */
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

/* =========================
   Daily 8 AM Cron Job
========================= */
cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Running daily task reminder job...');

  try {
    /**
     * Example assumption:
     * task-service exposes:
     * GET /api/tasks/summary
     * → returns tasks grouped by user email
     */
    const response = await axios.get(
      `${process.env.TASK_SERVICE_URL}/api/tasks/daily-summary`
    );

    const users = response.data.data;

    for (const user of users) {
      const taskList = user.tasks
        .map(t => `- ${t.title} (${t.status})`)
        .join('\n');

      const emailText = `
Good morning 👋

Here are your pending and in-progress tasks:

${taskList}

Have a productive day 🚀
`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: '🗓 Daily Task Reminder',
        text: emailText,
      });
    }

    console.log('✅ Daily emails sent successfully');
  } catch (error) {
    console.error('❌ Daily email job failed:', error.message);
  }
});

/* =========================
   Server Start
========================= */
app.listen(PORT, () => {
  console.log(`📧 Notification service running on port ${PORT}`);
});