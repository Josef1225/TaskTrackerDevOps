const API_BASE_URL = import.meta.env.VITE_TASK_API; // matches your .env

class TaskService {
  constructor(token = '') {
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  getAuthHeaders() {
    return this.token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` }
      : { 'Content-Type': 'application/json' };
  }

  async getAllTasks() {
    const response = await fetch(`${API_BASE_URL}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}`, {
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
}

export const taskService = new TaskService();