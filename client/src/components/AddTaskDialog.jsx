'use client';

import { useState } from 'react';

const AddTaskDialog = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in both title and description');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      });

      if (!result?.success) {
        setError(result?.message || 'Failed to create task');
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
              <p className="text-sm text-gray-600">Fill in the details below</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
            className="p-2 hover:bg-white/50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl animate-pulse">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-rose-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">
              Task Title *
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onFocus={() => setActiveField('title')}
                onBlur={() => setActiveField(null)}
                placeholder="What needs to be done?"
                maxLength={100}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all duration-300 placeholder-gray-400 disabled:bg-gray-50"
                disabled={isSubmitting}
              />
              <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ${activeField === 'title' ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${formData.title.length >= 90 ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'}`}>
                {formData.title.length}/100
              </span>
              <span className="text-xs text-gray-500">Required</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1">
              Description *
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setActiveField('description')}
                onBlur={() => setActiveField(null)}
                placeholder="Describe your task in detail..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all duration-300 resize-none placeholder-gray-400 disabled:bg-gray-50"
                disabled={isSubmitting}
              />
              <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ${activeField === 'description' ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${formData.description.length >= 450 ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'}`}>
                {formData.description.length}/500
              </span>
              <span className="text-xs text-gray-500">Required</span>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Status</label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 appearance-none cursor-pointer transition-all duration-300"
                  disabled={isSubmitting}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Priority</label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 appearance-none cursor-pointer transition-all duration-300"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Due Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                onFocus={() => setActiveField('dueDate')}
                onBlur={() => setActiveField(null)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 transition-all duration-300 cursor-pointer"
                disabled={isSubmitting}
              />
              <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ${activeField === 'dueDate' ? 'w-full' : 'w-0'}`}></div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 300);
              }}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskDialog;