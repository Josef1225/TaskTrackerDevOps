const axios = require('axios');
const nodemailer = require('nodemailer');

console.log('=== Testing Cron Job Logic ===');

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function runDailyJob() {
  try {
    console.log('1. Fetching users...');
    const usersRes = await axios.get('http://user-service:4000/api/users');
    const users = usersRes.data.data || [];
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      try {
        console.log(`\nProcessing ${user.email}...`);
        
        // Get tasks
        console.log('Fetching tasks...');
        const tasksRes = await axios.get(`http://task-service:5000/api/tasks?userId=${user._id}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        const tasks = tasksRes.data.data || [];
        console.log(`User has ${tasks.length} total tasks`);
        
        const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
        console.log(`Pending tasks: ${pendingTasks.length}`);
        
        if (pendingTasks.length === 0) {
          console.log('Skipping - no pending tasks');
          continue;
        }
        
        // Build email
        const taskList = pendingTasks.map(t => 
          `- ${t.title} [${t.status}]${t.dueDate ? ` (Due: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`
        ).join('\n');
        
        const emailText = `Good morning${user.name ? ' ' + user.name : ''}!\n\nHere are your pending/in-progress tasks:\n\n${taskList}\n\nTotal: ${pendingTasks.length} task(s)\n\nHave a productive day!`;
        
        // Send email
        console.log('Sending email...');
        const info = await transporter.sendMail({
          from: `"Task Manager" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `📋 Daily Task Reminder - ${pendingTasks.length} Pending Tasks`,
          text: emailText,
          html: `<p>Good morning${user.name ? ' ' + user.name : ''}!</p>
                 <p>Here are your pending/in-progress tasks:</p>
                 <ul>${pendingTasks.map(t => `<li><b>${t.title}</b> [${t.status}]${t.dueDate ? ` <i>(Due: ${new Date(t.dueDate).toLocaleDateString()})</i>` : ''}</li>`).join('')}</ul>
                 <p><b>Total:</b> ${pendingTasks.length} task(s)</p>
                 <p>Have a productive day! 🚀</p>`
        });
        
        console.log(`✅ Email sent to ${user.email}`);
        console.log(`Message ID: ${info.messageId}`);
        
      } catch (userError) {
        console.error(`❌ Error for user ${user.email}:`, userError.message);
      }
    }
    
    console.log('\n✅ Daily job completed successfully!');
    
  } catch (error) {
    console.error('❌ Daily job failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run it
runDailyJob();
