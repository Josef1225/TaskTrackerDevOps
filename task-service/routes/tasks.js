const express = require('express');
const { getAllTasks, createTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware'); // ✔ import correctly

const router = express.Router();

// Protect all routes so only authenticated users can access them
router.get('/', authMiddleware, getAllTasks);
router.post('/', authMiddleware, createTask);
router.delete('/:id', authMiddleware, deleteTask);

module.exports = router;
