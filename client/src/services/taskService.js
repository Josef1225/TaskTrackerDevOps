const API_BASE_URL = import.meta.env.VITE_TASK_API; 
// example: http://localhost:5000/api/tasks

class TaskService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getAuthHeaders() {
    if (!this.token) {
      throw new Error('No auth token set for TaskService');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  async getAllTasks() {
    const response = await fetch(API_BASE_URL, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async createTask(taskData) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteTask(taskId) {
    const response = await fetch(`${API_BASE_URL}/${taskId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // ✅ Make sure this is INSIDE the class
  async updateTaskStatus(taskId, status) {
    const response = await fetch(`${API_BASE_URL}/${taskId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const taskService = new TaskService();
