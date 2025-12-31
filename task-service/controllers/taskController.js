const Task = require('../models/Task');
const axios = require('axios');

// Get all tasks for the logged-in user
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

// Create a new task
// Create a new task - FIXED VERSION
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Create the task
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      status: status || 'pending',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      user: req.user.id, // from JWT
    });

    // FIXED: Use /api/users/me endpoint (which exists in user-service)
    let userEmail;
    try {
      console.log('=== Fetching User Email ===');
      console.log('User ID from token:', req.user.id);
      console.log('Authorization header present:', !!req.headers.authorization);
      
      // Get base URL from environment (without /api/users suffix)
      const userServiceBase = process.env.USER_SERVICE || 'http://user-service:4000';
      console.log('User service URL:', userServiceBase);
      
      // Call /api/users/me with the same auth token
      const response = await axios.get(`${userServiceBase}/api/users/me`, {
        headers: { 
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });
      
      console.log('User service response status:', response.status);
      console.log('User service response data:', JSON.stringify(response.data));
      
      // Extract email from response
      if (response.data && response.data.success) {
        // Format: { success: true, data: { email: '...' } }
        userEmail = response.data.data?.email;
      } else if (response.data && response.data.email) {
        // Format: { email: '...' }
        userEmail = response.data.email;
      } else if (response.data && response.data.data?.email) {
        // Another possible format
        userEmail = response.data.data.email;
      }
      
      console.log('Extracted email:', userEmail);
      
    } catch (userError) {
      console.error('❌ Failed to fetch user email');
      console.error('Error name:', userError.name);
      console.error('Error message:', userError.message);
      
      if (userError.response) {
        console.error('Response status:', userError.response.status);
        console.error('Response data:', userError.response.data);
        console.error('Response headers:', userError.response.headers);
      } else if (userError.request) {
        console.error('No response received. Request details:', userError.request);
      }
      
      console.error('Full error:', userError);
    }

    // Send email notification if we got the email
    if (userEmail) {
      try {
        console.log('=== Sending Notification ===');
        console.log('User email:', userEmail);
        
        const notificationServiceBase = process.env.NOTIFICATION_SERVICE || 'http://notification-service:5001';
        console.log('Notification service URL:', notificationServiceBase);
        
        // Make sure we're calling the correct endpoint
        const notificationResponse = await axios.post(
          `${notificationServiceBase}/api/notifications/send`,
          {
            to: userEmail,
            subject: `New Task Created: ${task.title}`,
            text: `Hello! You just created a new task:\n\nTitle: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}\nDue Date: ${task.dueDate || 'Not set'}`,
            html: `
              <h3>Hello!</h3>
              <p>You just created a new task:</p>
              <ul>
                <li><strong>Title:</strong> ${task.title}</li>
                <li><strong>Description:</strong> ${task.description}</li>
                <li><strong>Status:</strong> ${task.status}</li>
                <li><strong>Priority:</strong> ${task.priority}</li>
                <li><strong>Due Date:</strong> ${task.dueDate || 'Not set'}</li>
              </ul>
            `
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
          }
        );
        
        console.log('✅ Notification sent successfully');
        console.log('Notification response:', notificationResponse.data);
        
      } catch (emailError) {
        console.error('❌ Failed to send notification email');
        console.error('Error:', emailError.message);
        if (emailError.response) {
          console.error('Response status:', emailError.response.status);
          console.error('Response data:', emailError.response.data);
        }
      }
    } else {
      console.log('⚠️ No user email found, skipping notification');
    }

    res.status(201).json({ 
      success: true, 
      message: 'Task created successfully', 
      data: task,
      notificationSent: !!userEmail
    });
    
  } catch (error) {
    console.error('❌ Error creating task:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found or not authorized' });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { status },
      { new: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found or not authorized' });

    res.status(200).json({ success: true, message: 'Task status updated', data: task });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
};

module.exports = { getAllTasks, createTask, deleteTask, updateTaskStatus };