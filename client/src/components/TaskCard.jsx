'use client';

import { useState } from "react";
import { formatDate } from "../utils/dateUtils";

const statusColors = {
  pending: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  "in-progress": "bg-blue-50 text-blue-800 border border-blue-200",
  done: "bg-green-50 text-green-800 border border-green-200",
};

const priorityColors = {
  low: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  medium: "bg-amber-50 text-amber-800 border border-amber-200",
  high: "bg-rose-50 text-rose-800 border border-rose-200",
};

const TaskCard = ({ task, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const getStatusIcon = () => {
    switch (task.status) {
      case 'pending':
        return '⏳';
      case 'in-progress':
        return '🚀';
      case 'done':
        return '✅';
      default:
        return '📝';
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'low':
        return '⬇️';
      case 'medium':
        return '↔️';
      case 'high':
        return '⬆️';
      default:
        return '📊';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-blue-100 group backdrop-blur-sm bg-opacity-90 animate-fade-in`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title with gradient */}
          <div className="relative">
            <h3 className="text-xl font-bold text-gray-900 break-words leading-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              {task.title}
            </h3>
            <div className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`}></div>
          </div>

          {/* Description with fade effect */}
          <div className="relative">
            <p className="text-gray-600 break-words leading-relaxed line-clamp-3 transition-all duration-300">
              {task.description}
            </p>
            <div className="absolute bottom-0 right-0 w-1/3 h-6 bg-gradient-to-l from-white to-transparent"></div>
          </div>

          {/* Badges with icons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <span className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${statusColors[task.status] || "bg-gray-50 text-gray-800 border border-gray-200"}`}>
              <span className="text-sm">{getStatusIcon()}</span>
              {task.status.replace("-", " ").toUpperCase()}
            </span>
            <span className={`px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 ${priorityColors[task.priority] || "bg-gray-50 text-gray-800 border border-gray-200"}`}>
              <span className="text-sm">{getPriorityIcon()}</span>
              {task.priority.toUpperCase()}
            </span>
            {task.dueDate && (
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 border border-purple-100 font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Due: {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {/* Created At with improved styling */}
          <div className="flex items-center text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Created {formatDate(task.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Delete Button with improved animation */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`ml-4 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 hover:text-red-700 p-2.5 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 shadow-sm group/delete hover:scale-110 active:scale-95 ${isHovered ? 'opacity-100' : 'opacity-70'}`}
          title="Delete task"
        >
          {isDeleting ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <div className="relative">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover/delete:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;