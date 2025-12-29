'use client';

import TaskCard from "./TaskCard";

const TaskList = ({ tasks, onDeleteTask, onStatusChange }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-12 max-w-2xl mx-auto">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Tasks Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your task list is empty. Start by creating your first task to get things done!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4">
        {tasks.map((task, index) => (
          <div
            key={task._id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TaskCard 
              task={task} 
              onDelete={onDeleteTask} 
              onStatusChange={onStatusChange} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;