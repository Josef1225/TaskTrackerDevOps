'use client';

import { useState } from "react";
import { formatDate } from "../utils/dateUtils";

const statusColors = {
  pending: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200",
  "in-progress": "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200",
  done: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border border-emerald-200",
};

const priorityColors = {
  low: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200",
  medium: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200",
  high: "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-800 border border-rose-200",
};

const TaskCard = ({ task, onDelete, onStatusChange }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        await onDelete(task._id);
      } catch (error) {
        console.error("Error deleting task:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusChange(task._id, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusIndicator = () => {
    switch (task.status) {
      case 'pending': 
        return <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>;
      case 'in-progress': 
        return <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>;
      case 'done': 
        return <div className="w-2 h-2 rounded-full bg-emerald-500"></div>;
      default: 
        return <div className="w-2 h-2 rounded-full bg-gray-400"></div>;
    }
  };

  const getPriorityIndicator = () => {
    switch (task.priority) {
      case 'low': 
        return <div className="w-2 h-2 rounded-full bg-emerald-500"></div>;
      case 'medium': 
        return <div className="w-2 h-2 rounded-full bg-amber-500"></div>;
      case 'high': 
        return <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>;
      default: 
        return <div className="w-2 h-2 rounded-full bg-gray-400"></div>;
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.005] hover:border-indigo-100 group backdrop-blur-sm bg-opacity-95 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0 space-y-5">
          {/* Title */}
          <div className="relative">
            <h3 className="text-xl font-bold text-gray-900 break-words leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {task.title}
            </h3>
          </div>

          {/* Description */}
          <div className="relative">
            <p className="text-gray-600 break-words leading-relaxed line-clamp-3">
              {task.description}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mt-4 items-center">
            <span className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${statusColors[task.status] || "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200"}`}>
              <span className="flex items-center gap-1.5">
                {getStatusIndicator()}
                <span className="text-sm font-medium">
                  {task.status.replace("-", " ").toUpperCase()}
                </span>
              </span>
            </span>

            <span className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 ${priorityColors[task.priority] || "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200"}`}>
              <span className="flex items-center gap-1.5">
                {getPriorityIndicator()}
                <span className="text-sm font-medium">
                  {task.priority.toUpperCase()}
                </span>
              </span>
            </span>

            {task.dueDate && (
              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 border border-indigo-100 font-medium flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due: {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* Status Selector */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <label className="text-gray-700 text-sm font-medium">Status:</label>
              <select
                value={task.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all duration-200"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {updatingStatus && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </span>
              )}
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
            <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Created {formatDate(task.createdAt)}</span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 text-rose-600 p-3 rounded-xl transition-all duration-300 border border-rose-200 hover:border-rose-300 ${
            isHovered ? 'opacity-100' : 'opacity-80'
          }`}
          title="Delete task"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;