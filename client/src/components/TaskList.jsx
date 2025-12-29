'use client';

import { useState, useEffect, useRef } from 'react';
import TaskCard from "./TaskCard";

const TaskList = ({ tasks, onDeleteTask }) => {
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const isFirstLoad = useRef(true);

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

    // Only mark first load, no state update
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [tasks, filter, sortBy]); // priorityOrder is constant, no need in deps

  const getStatusStats = () => ({
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  });

  const stats = getStatusStats();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-12 max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">No Tasks Found</h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            Your task list is empty. Start by creating your first task to get things done!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header, stats, filters, sort omitted for brevity */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks match your filter</h3>
          <p className="text-gray-600">Try changing your filter settings</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task._id}
              className="animate-fade-in-up"
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
