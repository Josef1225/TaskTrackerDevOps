const cron = require('node-cron');
const fetch = require('node-fetch'); // to call Task Service API
const { sendEmail } = require('../services/emailService'); // your email sender

// Run every day at 8 AM
const dailyEmailJob = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily email job at 8 AM...');

    try {
      // Fetch all users from your User Service
      const usersResponse = await fetch(`${process.env.USER_SERVICE_URL}/users`);
      const users = await usersResponse.json();

      for (const user of users) {
        // Fetch tasks for this user
        const tasksResponse = await fetch(`${process.env.TASK_SERVICE_URL}/tasks?userId=${user._id}`);
        const tasks = await tasksResponse.json();

        const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');

        if (pendingTasks.length === 0) continue;

        // Build email content
        const emailText = pendingTasks.map(t => `• ${t.title} [${t.status}]`).join('\n');

        await sendEmail({
          to: user.email,
          subject: 'Your Daily Pending Tasks',
          text: `Good morning!\n\nHere are your pending/in-progress tasks:\n\n${emailText}`
        });

        console.log(`Sent daily task email to ${user.email}`);
      }
    } catch (err) {
      console.error('Error running daily email job:', err);
    }
  }, {
    timezone: "Your/Timezone" // e.g., "Africa/Algiers"
  });
};

module.exports = dailyEmailJob;