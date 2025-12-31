const cron = require('node-cron');
const fetch = require('node-fetch');
const { sendEmail } = require('../services/emailService');

// Run every day at 8 AM
const dailyEmailJob = () => {
  cron.schedule('30 9 * * *', async () => {
    console.log('⏰ Running daily email job at 8 AM...');
    console.log('User service URL:', process.env.USER_SERVICE_URL);
    console.log('Task service URL:', process.env.TASK_SERVICE_URL);

    try {
      // 1. Fetch all users from User Service - FIXED ENDPOINT
      const usersResponse = await fetch(`${process.env.USER_SERVICE_URL}/api/users`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!usersResponse.ok) {
        throw new Error(`User service error: ${usersResponse.status} ${usersResponse.statusText}`);
      }
      
      const usersData = await usersResponse.json();
      console.log(`Found ${usersData.length || usersData.data?.length || 0} users`);
      
      // Handle different response formats
      const users = usersData.data || usersData;
      
      if (!Array.isArray(users) || users.length === 0) {
        console.log('No users found, skipping email job');
        return;
      }

      for (const user of users) {
        try {
          console.log(`Processing user: ${user.email || user._id}`);
          
          // 2. Fetch tasks for this user - FIXED ENDPOINT
          const tasksResponse = await fetch(
            `${process.env.TASK_SERVICE_URL}/api/tasks?userId=${user._id}`,
            {
              headers: { 'Content-Type': 'application/json' }
            }
          );
          
          if (!tasksResponse.ok) {
            console.error(`Task service error for user ${user._id}: ${tasksResponse.status}`);
            continue;
          }
          
          const tasksData = await tasksResponse.json();
          const tasks = tasksData.data || tasksData;
          
          // Filter pending/in-progress tasks
          const pendingTasks = Array.isArray(tasks) 
            ? tasks.filter(t => t.status === 'pending' || t.status === 'in-progress')
            : [];
          
          if (pendingTasks.length === 0) {
            console.log(`No pending tasks for user ${user.email}, skipping`);
            continue;
          }

          console.log(`Found ${pendingTasks.length} pending tasks for ${user.email}`);

          // 3. Build email content
          const emailText = pendingTasks
            .map(t => `• ${t.title} [${t.status}]${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`)
            .join('\n');
          
          const emailHtml = `
            <h3>Good morning! 👋</h3>
            <p>Here are your pending/in-progress tasks for today:</p>
            <ul>
              ${pendingTasks.map(t => 
                `<li><strong>${t.title}</strong> [${t.status}]${t.dueDate ? ` <em>(Due: ${new Date(t.dueDate).toLocaleDateString()})</em>` : ''}</li>`
              ).join('')}
            </ul>
            <p>Total: ${pendingTasks.length} tasks</p>
            <p>Have a productive day! 🚀</p>
          `;

          // 4. Send email
          await sendEmail({
            to: user.email,
            subject: `📋 Your Daily Task Reminder - ${pendingTasks.length} Pending Tasks`,
            text: `Good morning!\n\nHere are your pending/in-progress tasks:\n\n${emailText}\n\nTotal: ${pendingTasks.length} tasks\n\nHave a productive day!`,
            html: emailHtml
          });

          console.log(`✅ Sent daily task email to ${user.email}`);
          
        } catch (userError) {
          console.error(`❌ Error processing user ${user._id}:`, userError.message);
          continue; // Continue with next user
        }
      }
      
      console.log('✅ Daily email job completed successfully');
      
    } catch (err) {
      console.error('❌ Error running daily email job:', err.message);
      console.error('Stack:', err.stack);
    }
  }, {
    timezone: "UTC" // Change to your timezone, e.g., "Africa/Algiers" for Algeria
  });
};

module.exports = dailyEmailJob;