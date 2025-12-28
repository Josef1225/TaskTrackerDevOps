'use client';

import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import AddTaskDialog from './components/AddTaskDialog';
import LoadingSpinner from './components/LoadingSpinner';
import SignInForm from './components/SignInForm';
import SignUpForm from './components/SignupForm';
import { taskService } from './services/taskService';
import { userService } from './services/UserService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showSignIn, setShowSignIn] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch user info if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        userService.setToken(token); // attach token to userService
        const response = await userService.getCurrentUser();
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setToken(null);
        localStorage.removeItem('token');
      }
    };
    fetchUser();
  }, [token]);

  // Attach token to taskService whenever it changes
  useEffect(() => {
    if (token) taskService.setToken(token);
  }, [token]);

  // Fetch tasks when user is logged in
  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  // Task Functions
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks((prev) => [response.data, ...prev]);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // User Functions
  const handleSignIn = async (credentials) => {
    try {
      const response = await userService.signIn(credentials);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleSignUp = async (userData) => {
    try {
      const response = await userService.signUp(userData);
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Render login/signup if no user, else dashboard
  if (!user) {
    return showSignIn ? (
      <SignInForm
        onSignIn={handleSignIn}
        switchToSignUp={() => setShowSignIn(false)}
      />
    ) : (
      <SignUpForm
        onSignUp={handleSignUp}
        switchToSignIn={() => setShowSignIn(true)}
      />
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-1">Simple task management for DevOps demo</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12 text-red-700">{error}</div>
        ) : (
          <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />
        )}
      </main>

      {/* Add Task Dialog */}
      {isDialogOpen && (
        <AddTaskDialog onClose={() => setIsDialogOpen(false)} onSubmit={handleAddTask} />
      )}
    </div>
  );
}

export default App;