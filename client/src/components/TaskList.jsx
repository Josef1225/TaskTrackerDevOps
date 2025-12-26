'use client';

import { useState, useEffect } from 'react';
import TaskCard from "./TaskCard";

const TaskList = ({ tasks, onDeleteTask }) => {
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const priorityOrder = { high: 3, medium: 2, low: 1 };

  useEffect(() => {
    let result = [...tasks];
    
    // Apply filter
    if (filter !== 'all') {
      result = result.filter(task => task.status === filter || task.priority === filter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });
    
    setFilteredTasks(result);
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [tasks, filter, sortBy, priorityOrder, isInitialLoad]);

  const getStatusStats = () => {
    const stats = {
      pending: tasks.filter(t => t.status === 'pending').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (tasks.length === 0) {
    return (
      <div className={`text-center py-16 ${isInitialLoad ? 'animate-fade-in' : ''}`}>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-12 max-w-2xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-20 h-20 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">?</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            No Tasks Found
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            Your task list is empty. Start by creating your first task to get things done!
          </p>
          <div className="flex justify-center space-x-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
              <span className="text-blue-800 font-medium">Click "Add Task" to begin</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isInitialLoad ? 'animate-fade-in' : ''}`}>
      {/* Header with stats and filters */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your Tasks
              <span className="ml-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                {tasks.length}
              </span>
            </h2>
            <p className="text-gray-600">Manage and organize your tasks efficiently</p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-yellow-800">{stats.pending}</span>
                <span className="text-yellow-600">Pending</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-blue-800">{stats['in-progress']}</span>
                <span className="text-blue-600">In Progress</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-bold text-green-800">{stats.done}</span>
                <span className="text-green-600">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Filter Tasks</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${filter === 'all' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${filter === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${filter === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
              >
                In Progress
              </button>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Sort By</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-48 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer transition-all duration-300"
              >
                <option value="createdAt">Newest First</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md mx-auto">
            <div className="text-gray-300 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks match your filter</h3>
            <p className="text-gray-600">Try changing your filter settings</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task._id}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard task={task} onDelete={onDeleteTask} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;