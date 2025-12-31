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
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   Health Endpoint
========================= */
app.get('/health', (req, res) => {
  res.json({ message: 'Notification service is running!' });
});

/* =========================
   Email Endpoint - MATCHES what task-service calls
========================= */
app.post('/api/notifications/send', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    console.log('📧 Sending email to:', to);
    console.log('📝 Subject:', subject);
    
    const mailOptions = {
      from: `"Task Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
    };
    
    if (html) {
      mailOptions.html = html;
    } else {
      mailOptions.text = text;
    }

    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully to:', to);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('❌ Error sending email:', err);
    res.status(500).json({ success: false, message: 'Failed to send email', error: err.message });
  }
});

/* =========================
   Legacy endpoint for backward compatibility
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
   Daily 8 AM Cron Job - UPDATED
========================= */
const dailyEmailJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily task reminder job...');

    try {
      // 1. Get all users from user-service
      const usersResponse = await axios.get(
        `${process.env.USER_SERVICE_URL}/api/users`,
        { timeout: 10000 }
      );

      const users = usersResponse.data.data || [];
      console.log(`Found ${users.length} users`);

      for (const user of users) {
        try {
          // 2. Get tasks for this user
          const tasksResponse = await axios.get(
            `${process.env.TASK_SERVICE_URL}/api/tasks?userId=${user._id}`,
            { 
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000
            }
          );

          const tasks = tasksResponse.data.data || [];
          const pendingTasks = tasks.filter(t => 
            t.status === 'pending' || t.status === 'in-progress'
          );

          if (pendingTasks.length === 0) {
            console.log(`No pending tasks for ${user.email}, skipping`);
            continue;
          }

          // 3. Build email
          const taskList = pendingTasks
            .map(t => `- ${t.title} (${t.status})${t.dueDate ? ` - Due: ${new Date(t.dueDate).toLocaleDateString()}` : ''}`)
            .join('\n');

          const emailText = `
Good morning ${user.name || ''} 👋

Here are your pending and in-progress tasks:

${taskList}

Total: ${pendingTasks.length} task(s)

Have a productive day! 🚀
`;

          // 4. Send email
          await transporter.sendMail({
            from: `"Task Manager" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '🗓 Daily Task Reminder',
            text: emailText,
          });

          console.log(`✅ Daily email sent to ${user.email}`);
        } catch (userError) {
          console.error(`❌ Error processing user ${user.email}:`, userError.message);
          continue;
        }
      }

      console.log('✅ Daily email job completed');
    } catch (error) {
      console.error('❌ Daily email job failed:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
    }
  }, {
    timezone: "UTC"
  });
};

// Start the scheduler
dailyEmailJob();

/* =========================
   Server Start
========================= */
app.listen(PORT, () => {
  console.log(`📧 Notification service running on port ${PORT}`);
  console.log(`📧 Email user: ${process.env.EMAIL_USER ? 'Set' : 'Not set'}`);
  console.log(`🔗 User service URL: ${process.env.USER_SERVICE_URL || 'Not set'}`);
  console.log(`🔗 Task service URL: ${process.env.TASK_SERVICE_URL || 'Not set'}`);
  console.log(`✅ Health endpoint: /health`);
  console.log(`✅ Email endpoint: POST /api/notifications/send`);
});