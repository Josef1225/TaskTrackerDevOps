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

    // Fetch user email from user-service
    let userEmail;
    try {
      const response = await axios.get(`http://localhost:4000/api/users/me`, {
        headers: { Authorization: req.headers.authorization }
      });
      userEmail = response.data.data.email;
    } catch (userError) {
      console.error('Failed to fetch user email:', userError.message);
    }

    // Send email if email exists
    if (userEmail) {
      try {
        await axios.post('http://localhost:5001/send-email', {
          to: userEmail,
          subject: `New Task Created: ${task.title}`,
          text: `Hello! You just created a new task:\n\nTitle: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}`
        });
      } catch (emailError) {
        console.error('Email failed:', emailError.message);
      }
    }

    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    console.error('Error creating task:', error);
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
