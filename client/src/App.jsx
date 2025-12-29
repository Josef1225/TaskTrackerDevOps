'use client';

import { useState, useEffect, useMemo } from 'react';
import TaskList from './components/TaskList';
import AddTaskDialog from './components/AddTaskDialog';
import LoadingSpinner from './components/LoadingSpinner';
import SignInForm from './components/SignInForm';
import SignUpForm from './components/SignUpForm';
import { taskService } from './services/taskService';
import { userService } from './services/userService';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showSignIn, setShowSignIn] = useState(true);
  
  // Filter states only (no sort)
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
        userService.setToken(token);
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

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t._id === taskId ? response.data : t));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Filter tasks (no sorting)
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 animate-fade-in">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-gray-600 mt-1">Simple task management for DevOps demo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Welcome, <span className="text-indigo-600">{user.name}</span>
              </span>
            </div>
            
            <button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
            
            <button
              onClick={() => {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
                resetFilters();
              }}
              className="bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-600 px-5 py-3 rounded-xl font-medium hover:border-rose-300 border border-rose-200 transition-all duration-300 flex items-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 text-rose-700 border border-rose-200 text-center animate-pulse">
            <svg className="w-6 h-6 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{tasks.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {tasks.filter(t => t.status === 'done').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {tasks.filter(t => t.status === 'in-progress').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {tasks.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Filters</h3>
                  <p className="text-sm text-gray-600">Filter your tasks to find what you need</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                  </span>
                  {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Tasks</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title or description..."
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all duration-300 placeholder-gray-400"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all duration-300 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all duration-300 cursor-pointer"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {statusFilter !== 'all' && (
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200 text-sm font-medium flex items-center gap-1.5">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter('all')}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {priorityFilter !== 'all' && (
                      <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 text-rose-800 border border-rose-200 text-sm font-medium flex items-center gap-1.5">
                        Priority: {priorityFilter}
                        <button
                          onClick={() => setPriorityFilter('all')}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Task List */}
            {filteredTasks.length > 0 ? (
              <TaskList 
                tasks={filteredTasks} 
                onDeleteTask={handleDeleteTask} 
                onStatusChange={handleUpdateTaskStatus} 
              />
            ) : (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'No tasks match your filters' 
                    : 'No tasks yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters or search criteria'
                    : 'Get started by creating your first task'}
                </p>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Clear Filters & Create Task'
                    : 'Create Your First Task'}
                </button>
                {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="ml-3 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
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